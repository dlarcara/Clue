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
        _.forEach(this.getAllCardsExcept(cardsInHand), (card) => { this.markCardAsNotHadByPlayer(player, card); });
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

        //Recusively attempt to resolve all unresolved guesses until nothing new is found out
        this.replayAllGuessesUntilNothingNewIsFoundOut();
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
            _.forEach(this.getAllCardsExcept(knownHadCardsForPlayer), (c) => { this.markCardAsNotHadByPlayer(player, c)});
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
            _.forEach(this.getAllCardsExcept(knowNotHadCardsForPlayer), (c) => { this.markCardAsHadByPlayer(player, c)});
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

    private replayAllGuessesUntilNothingNewIsFoundOut() : void
    {
        let previousNumberOfUnresolvedGuesses = this.unresolvedGuesses.length;

        //Itereate through all unresolved guesses and attempt to resolve them
        _.forEach(this.unresolvedGuesses, (guess) => {
            this.attemptToResolveGuess(guess);
        });

        //If any guess was resolved try replaying guesses again in case the new information resolves another guess
        if (previousNumberOfUnresolvedGuesses != this.unresolvedGuesses.length)
            this.replayAllGuessesUntilNothingNewIsFoundOut();
    }

    private attemptToResolveGuess(guess : Guess) : void
    {
        //Figure out owner of each guessed card
        let suspectCardOwner = this.sheet.getPlayerWhoHasCard(new Card(CardCategory.SUSPECT, guess.suspect));
        let weaponCardOwner = this.sheet.getPlayerWhoHasCard(new Card(CardCategory.WEAPON, guess.weapon));
        let roomCardOwner = this.sheet.getPlayerWhoHasCard(new Card(CardCategory.ROOM, guess.room));
        
        var cardOwners = [suspectCardOwner, weaponCardOwner, roomCardOwner];
        let numberOfKnownCardsInGuess = cardOwners.filter(Boolean).length; //How many of these cards have known owners

        //If we've identified that any of these cards is owned by shower we can resolve this guess
        //If all the cards are known we can also resolve this guess
        if (_.find(cardOwners, guess.playerThatShowed) || numberOfKnownCardsInGuess == 3)
        {
            _.remove(this.unresolvedGuesses, guess);
            return;
        }

        ///If 2 of the cards are known, and not by the shower, the reamining card is what card was shown
        if (numberOfKnownCardsInGuess == 2) 
        {
            let knownCard;
            if (!suspectCardOwner) knownCard = new Card(CardCategory.SUSPECT, guess.suspect);
            if (!weaponCardOwner) knownCard = new Card(CardCategory.WEAPON, guess.weapon);
            if (!roomCardOwner) knownCard = new Card(CardCategory.ROOM, guess.room);

            this.markCardAsHadByPlayer(guess.playerThatShowed, knownCard);

            _.remove(this.unresolvedGuesses, guess);
            return;
        }

        //Otherwise we don't have enough information to resolve the guess and it remains unresolved
    }

    private playerIsPlaying(player : Player) : Boolean
    {
        return !!_.find(this.players, player);
    }

    private getAllCardsExcept(cards : Card[]) : Card[]
    {
        return GameConstants.ALLCARDS.filter((card) => { return !_.find(cards, card); });
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