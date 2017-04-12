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

        //Mark all people who didn't show as not having any of the cards
        this.markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess);

        //Evaulte guess for what may be known
        this.evaluateGuess(guess);

        //Recusively attempt to resolve guesses until
        this.replayAllGuessesUntilNothingNewIsFoundOut();
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        if(this.getStatusForPlayerAndCard(player, card) == CellStatus.HAD)
            return;

        //Mark this card as had by this player
        this.sheet.setStatusForPlayerAndCard(player, card, CellStatus.HAD);

        //Mark all other players as not having this card
        _.forEach(this.getAllOtherPlayers(player), (p) => { this.markCardAsNotHadByPlayer(p, card); });

        //Mark all other cards as not had by this player if all their cards as known
        let knownHadCardsForPlayer = this.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        if (player.numberOfCards == knownHadCardsForPlayer.length)
            _.forEach(this.getAllCardsExcept(knownHadCardsForPlayer), (c) => { this.markCardAsNotHadByPlayer(player, c)});
    }

    private markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        if(this.getStatusForPlayerAndCard(player, card) == CellStatus.NOTHAD)
            return;

        //Mark this card as not had by a player
        this.sheet.setStatusForPlayerAndCard(player, card, CellStatus.NOTHAD);

        //Mark all remaining cards as had by this player if all their not had cards have been identified
        let knowNotHadCardsForPlayer = this.getAllCardsForPlayerInGivenStatus(player, CellStatus.NOTHAD);
        if ((GameConstants.ALLCARDS.length - knowNotHadCardsForPlayer.length) == player.numberOfCards)
            _.forEach(this.getAllCardsExcept(knowNotHadCardsForPlayer), (c) => { this.markCardAsHadByPlayer(player, c)});
    }

    private markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess : Guess)
    {
        let lastPlayerInTurn = (!guess.playerThatShowed) ? guess.playerThatGuessed : guess.playerThatShowed;

        let currentPlayer = this.getNextPlayer(guess.playerThatGuessed);
        while(!_.isEqual(currentPlayer, lastPlayerInTurn))
        { 
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.SUSPECT, guess.suspect));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.WEAPON, guess.weapon));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.ROOM, guess.room));

            currentPlayer = this.getNextPlayer(currentPlayer);
        }
    }

    private evaluateGuess(guess : Guess) : void
    {
        if (guess.playerThatShowed && guess.cardShown)
            this.markCardAsHadByPlayer(guess.playerThatShowed, guess.cardShown);
        else if (guess.playerThatShowed)
            this.unresolvedGuesses.push(guess);
    }

    private replayAllGuessesUntilNothingNewIsFoundOut() : void
    {
        _.forEach(this.unresolvedGuesses, (guess) => {
            this.attemptToResolveGuess(guess);
        });
    }

    private attemptToResolveGuess(guess : Guess) : void
    {
        let suspectCardOwner = this.getPlayerWhoHasCard(new Card(CardCategory.SUSPECT, guess.suspect));
        let weaponCardOwner = this.getPlayerWhoHasCard(new Card(CardCategory.WEAPON, guess.weapon));
        let roomCardOwner = this.getPlayerWhoHasCard(new Card(CardCategory.ROOM, guess.room));

        //Get number of known cards in this guess
        let numberOfKnownCardsInGuess = [suspectCardOwner, weaponCardOwner, roomCardOwner].filter(Boolean).length;

        if (numberOfKnownCardsInGuess == 3) //All cards are known, mark this guess as resolved
        {
            _.remove(this.unresolvedGuesses, guess);
        }
        else if (numberOfKnownCardsInGuess == 2) //The card that was shown is known, mark it has had by the shower and mark guess as resolved
        {
            let knownCard;
            if (!suspectCardOwner) knownCard = new Card(CardCategory.SUSPECT, guess.suspect);
            if (!weaponCardOwner) knownCard = new Card(CardCategory.WEAPON, guess.weapon);
            if (!roomCardOwner) knownCard = new Card(CardCategory.ROOM, guess.room);

            this.markCardAsHadByPlayer(guess.playerThatShowed, knownCard);

            _.remove(this.unresolvedGuesses, guess);
        }
    }

    private getPlayerWhoHasCard(card : Card) : Player
    {
        return _.find(this.players, (p) => { return this.getStatusForPlayerAndCard(p, card) == CellStatus.HAD; });
    }

    private playerIsPlaying(player : Player) : Boolean
    {
        return !!_.find(this.players, player);
    }

    private getAllCardsForPlayerInGivenStatus(player : Player, cellStatus : CellStatus)
    {
        return GameConstants.ALLCARDS.filter((card) => {
            return this.sheet.getStatusForPlayerAndCard(player, card) == cellStatus;
        });
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