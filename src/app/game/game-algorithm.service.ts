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
        //Ensure unique players 
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        //Ensure game involves at least 3 players
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

        _.forEach(cardsInHand, (card) => { this.markCardAsHadByPlayer(player, card); });

        _.forEach(this.getAllCardsExcept(cardsInHand), (card) => { this.markCardAsNotHadByPlayer(player, card); });
    }

    applyGuess(guess : Guess) : void
    {   
        if (!this.playerIsPlaying(guess.playerThatGuessed))
            throw new Error("Guessing player not found");
        
        if (!!guess.playerThatShowed && !this.playerIsPlaying(guess.playerThatShowed))
            throw new Error("Showing player not found");

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

    private getAllCardsExcept(cards : Card[]) : Card[]
    {
        return GameConstants.ALLCARDS.filter((card) => { return !_.find(cards, card); });
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        this.sheet.markCardAsHadByPlayer(player, card);

        _.forEach(this.getAllOtherPlayers(player), (p) => { this.markCardAsNotHadByPlayer(p, card); });
    }

    private markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        this.sheet.markCardAsNotHadByPlayer(player, card);
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