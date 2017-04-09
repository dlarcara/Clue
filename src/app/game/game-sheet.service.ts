import { GameSheet, Player, CardCategory, Card, Suspect, Weapon, Room, CellStatus } from "./index";

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameSheetService
{
    private sheet: GameSheet;
    private players: Player[];

    constructor(players : Player[])
    {
        //Ensure unique players 
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        //Ensure game involves at least 3 players
        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        this.players = players;
        this.sheet = new GameSheet(players.length);
    }

    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {
        let playerIndex = this.findPlayerIndex(player);
        return this.sheet.getStatusForPlayerAndCard(playerIndex, card.category, card.cardIndex);
    }

    markCardAsHadByPlayer(player: Player, card : Card) : void
    {
        let playerIndex = this.findPlayerIndex(player);
        this.sheet.markCardAsHadByPlayer(playerIndex, card.category, card.cardIndex);

        //Mark other players as not having card
        _.forEach(this.getAllOtherPlayers(player), (p) => {
            this.markCardAsNotHadByPlayer(p, card);
        });
    }

    //Mark card as not had by player passed in, verifying that the status isn't already set differently
    markCardAsNotHadByPlayer(player: Player, card : Card) : void
    {
        let playerIndex = this.findPlayerIndex(player);
        this.sheet.markCardAsNotHadByPlayer(playerIndex, card.category, card.cardIndex);
    }

    //Get all other players to operate on except the excluded player passsed in
    private getAllOtherPlayers(playerToExclude : Player) : Player[]
    {
        return _.filter(this.players, (p) => { return !_.isEqual(p, playerToExclude);});
    }

    //Get index into players array given player, verify it exists
    private findPlayerIndex(player : Player) : Number
    {
        let playerIndex = _.findIndex(this.players, player);

        if(playerIndex == -1)
            throw new Error("Invalid player supplied");

        return playerIndex;
    }
}