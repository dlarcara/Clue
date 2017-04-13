import { GameSheet, Player, CardCategory, Card, Suspect, Weapon, Room, CellStatus, Guess, GameConstants } from "./index";

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameAlgorithm
{
    private sheet: GameSheet;
    private players: Player[];
    private unresolvedGuesses : Guess[]

    constructor(players : Player[])
    {
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        this.players = players;
        this.sheet = new GameSheet(players);
        this.unresolvedGuesses = [];
    }

    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {     
        if (!this.playerIsPlaying(player))
            throw new Error("Player not found");

        return this.sheet.getStatusForPlayerAndCard(player, card);
    }

    fillOutKnownCards(player : Player, cardsInHand : Card[]) : void
    {
         if (!this.playerIsPlaying(player))
            throw new Error("Player not found");

        //Mark all cards passed in as had by this player
        _.forEach(cardsInHand, (card) => { this.markCardAsHadByPlayer(player, card); });

        //Mark all other cards as not had for this player
        _.forEach(GameConstants.allCardsExcept(cardsInHand), (card) => { this.markCardAsNotHadByPlayer(player, card); });
    }

    applyGuess(guess : Guess) : void
    {   
        if (!this.playerIsPlaying(guess.playerThatGuessed))
            throw new Error("Guessing player not found");
        
        if (!!guess.playerThatShowed && !this.playerIsPlaying(guess.playerThatShowed))
            throw new Error("Showing player not found");

        //Mark all people who passed as not having any of the cards
        this.markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess);

        //If shower and shown card is known mark it appropiately, otherwise start tracking the guess as unresolved if someone did show
        if (guess.playerThatShowed && guess.cardShown)
            this.markCardAsHadByPlayer(guess.playerThatShowed, guess.cardShown);
        else if (guess.playerThatShowed)
            this.unresolvedGuesses.push(guess);

        //Recursively attempt to resovle all unresolved guesses and deduce verdicts for each category until nothing new is found out
        this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();
    }

    getUnresolvedGuesses() : Guess[]
    {
        return this.unresolvedGuesses;
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //Short circuit any work if the card is already marked as had
        if(this.getStatusForPlayerAndCard(player, card) == CellStatus.HAD)
            return;

        //Mark this card as had by this player
        this.sheet.markCardAsHadByPlayer(player, card);

        //Mark all other players as not having this card
        _.forEach(this.getAllOtherPlayers(player), (p) => { this.markCardAsNotHadByPlayer(p, card); });

        //Mark all other cards as not had by this player if all their cards are known
        let knownHadCardsForPlayer = this.sheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        if (player.numberOfCards == knownHadCardsForPlayer.length)
            _.forEach(GameConstants.allCardsExcept(knownHadCardsForPlayer), (c) => { this.markCardAsNotHadByPlayer(player, c)});
    }

    private markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        //Short circuit any work if the card is already marked as not had
        if(this.getStatusForPlayerAndCard(player, card) == CellStatus.NOTHAD)
            return;

        //Mark this card as not had by a player
        this.sheet.markCardAsNotHadByPlayer(player, card);

        //Mark all remaining cards as had by this player if all their not had cards have been identified
        let knowNotHadCardsForPlayer = this.sheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.NOTHAD);
        if ((GameConstants.ALLCARDS.length - knowNotHadCardsForPlayer.length) == player.numberOfCards)
            _.forEach(GameConstants.allCardsExcept(knowNotHadCardsForPlayer), (c) => { this.markCardAsHadByPlayer(player, c)});
    }

    private markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess : Guess)
    {
        //Last player in the turn is either the shower, or guesser if no one showed
        let lastPlayerInTurn = (!guess.playerThatShowed) ? guess.playerThatGuessed : guess.playerThatShowed;

        //Iterate through all players who passed and mark them as not having any of the cards guessed
        let currentPlayer = this.getNextPlayer(guess.playerThatGuessed);
        while(!_.isEqual(currentPlayer, lastPlayerInTurn))
        { 
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.SUSPECT, guess.suspect));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.WEAPON, guess.weapon));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.ROOM, guess.room));

            currentPlayer = this.getNextPlayer(currentPlayer);
        }
    }

    private replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut() : void
    {
        let previousNumberOfUnresolvedGuesses = this.unresolvedGuesses.length;

        //Itereate through all unresolved guesses and attempt to resolve them
        _.forEach(this.unresolvedGuesses, (guess) => {this.attemptToResolveGuess(guess); });

        //If any guess was resolved try replaying guesses again in case the new information resolves another guess
        if (previousNumberOfUnresolvedGuesses != this.unresolvedGuesses.length)
            this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();

        //Check all categories to see if the verdict can be deduced for that category
        //Can be done if the owner for all other cards in that category have been identified
        let previousVerdict = this.sheet.getVerdict();
        this.attemptToDeduceVerdictInEachCategory();
        
        //If verdict has changed attempt replaying all guesses again, the board now has new informtion on it
        if (!_.isEqual(previousVerdict, this.sheet.getVerdict()))
            this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();
    }

    private attemptToResolveGuess(guess : Guess) : void
    {
        let shower = guess.playerThatShowed;
        let guessedCards = [new Card(CardCategory.SUSPECT, guess.suspect), new Card(CardCategory.WEAPON, guess.weapon), new Card(CardCategory.ROOM, guess.room)];

        //If any of the cards is known to be had by the shower we can stop trying to resolve this guess
        //They may have more than one of these cards, but there is no way of knowing which one it is they showed for sure
        let cardsPlayerDefinitelyHas = _.filter(guessedCards, (card) => { return this.getStatusForPlayerAndCard(shower, card) == CellStatus.HAD});
        if (cardsPlayerDefinitelyHas.length)
        {
            _.remove(this.unresolvedGuesses, guess);
            return; 
        }

        //If there is only 1 card left that this player might have than we can resolve this guess
        let cardsPlayerMightHave = _.filter(guessedCards, (card) => { return this.getStatusForPlayerAndCard(shower, card) == CellStatus.UNKNOWN});
        if (cardsPlayerMightHave.length == 1)
        {
            this.markCardAsHadByPlayer(shower, cardsPlayerMightHave[0]);
            _.remove(this.unresolvedGuesses, guess); 
        }

        //Otherwise we don't have enough information to resolve the guess and it remains unresolved
    }

    private attemptToDeduceVerdictInEachCategory() : void
    {
        this.attemptToDeduceVerdictInCategory(CardCategory.SUSPECT);
        this.attemptToDeduceVerdictInCategory(CardCategory.WEAPON);
        this.attemptToDeduceVerdictInCategory(CardCategory.ROOM);
    }

    private attemptToDeduceVerdictInCategory(cardCategory : CardCategory) : void
    {
        //Get all cards in the given category
        let allCardsInCategory = GameConstants.allCardsInCategory(cardCategory);
        
        //Check if all but one card in this category has an identified owner, if so no one has the last card
        let knownCardsInCategory = _.filter(allCardsInCategory, (card) => { return this.sheet.getPlayerWhoHasCard(card); });
        if (knownCardsInCategory.length == allCardsInCategory.length - 1)
        {
            let verdictInCategory = _.difference(allCardsInCategory, knownCardsInCategory)[0];
            _.forEach(this.players, (player) => { this.markCardAsNotHadByPlayer(player, verdictInCategory)});
        }
    }

    private playerIsPlaying(player : Player) : Boolean
    {
        return !!_.find(this.players, player);
    }

    private getAllOtherPlayers(playerToExclude : Player) : Player[] 
    {
        return _.differenceWith(this.players, [playerToExclude], _.isEqual);
    }

    private getNextPlayer(player: Player) : Player
    {
        let playerIndex = _.findIndex(this.players, player);
        let nextPlayerIndex = (playerIndex == (this.players.length - 1)) ? 0 : +playerIndex + 1;
        return this.players[nextPlayerIndex];
    }
}