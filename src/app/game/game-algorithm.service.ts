import { GameSheet, Player, CardCategory, Card, Suspect, Weapon, Room, CellStatus, Guess, GameConstants } from "./index";

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameAlgorithm
{
    private sheet: GameSheet;
    private players: Player[];

    private readonly 

    constructor(players : Player[])
    {
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        this.players = players;
        this.sheet = new GameSheet(players);
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
        this.markCardsAsNotHadAllForPlayersWhoDidNotShowByGuess(guess);

        //Mark the shower of the card as having that card
        if (guess.playerThatShowed && guess.cardShown)
            this.markCardAsHadByPlayer(guess.playerThatShowed, guess.cardShown);
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //Mark this card as had by this player
        this.sheet.markCardAsHadByPlayer(player, card);

        //Mark all other players as not having this card
        _.forEach(this.getAllOtherPlayers(player), (p) => { this.markCardAsNotHadByPlayer(p, card); });

        //Mark all other cards as not had by this player if all their cards as known
        let knownHadCardsForPlayer = this.getAllKnownHadCardsForPlay(player);
        if (player.numberOfCards == knownHadCardsForPlayer.length)
            _.forEach(this.getAllCardsExcept(knownHadCardsForPlayer), (c) => { this.markCardAsNotHadByPlayer(player, c)});
    }

    private markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        //Mark this card as not had by a player
        this.sheet.markCardAsNotHadByPlayer(player, card);

        //TODO: Mark reamining unknown cards as had if all of the cards the player does not have are identified
        //(TotalNumberOfCards - KnownNotHaveCardsForThisPlayer = NumberOfPlayersCards)
    }

    private markCardsAsNotHadAllForPlayersWhoDidNotShowByGuess(guess : Guess)
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

    private playerIsPlaying(player : Player) : Boolean
    {
        return !!_.find(this.players, player);
    }

    private getAllKnownHadCardsForPlay(player : Player) : Card[]
    {
        return GameConstants.ALLCARDS.filter((card) => {
            return this.sheet.getStatusForPlayerAndCard(player, card) == CellStatus.HAD;
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