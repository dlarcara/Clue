import { Player, CardCategory, Card, Suspect, Weapon, Room } from "./index";

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameSheet
{
    private sheet: any[] = [];
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

        this.fillOutBlankSheet(players);
    }

    //Returns:
    //  True: Player has card
    //  False: Player does not have card
    //  Undefined: Unkown
    doesPlayerHaveCard(player: Player, card : Card) : Boolean
    {
        let playerIndex = this.findPlayerIndex(player);
        if(playerIndex == -1)
            throw new Error("Invalid player supplied");
            
        return this.sheet[card.category][+card.cardIndex][+playerIndex];
    }

    markCardAsHadByPlayer(player: Player, card : Card) : void
    {
        let playerIndex = this.findPlayerIndex(player);
        if(playerIndex == -1)
            throw new Error("Invalid player supplied");

        this.sheet[card.category][+card.cardIndex][+playerIndex] = true;
    }

    private fillOutBlankSheet(players : Player[]) : void
    {
        this.sheet[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(players.length, _.constant(undefined)); });
        this.sheet[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(players.length, _.constant(undefined)); });
        this.sheet[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(players.length, _.constant(undefined)); });
    }

    private findPlayerIndex(player : Player) : Number
    {
        return _.findIndex(this.players, player);
    }
}