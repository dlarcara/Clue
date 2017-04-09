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
        return this.sheet[card.category][+card.cardIndex][+playerIndex];
    }

    //Mark card as had by player passed in, verifying that the status isn't already set differently
    //Also mark all other players as not having this card
    markCardAsHadByPlayer(player: Player, card : Card) : void
    {
        let playerIndex = this.findPlayerIndex(player);

        this.ensureCardIsNotMarkedDifferentlyAlready(player, card, true);

        //Mark Card as had for this player
        this.sheet[card.category][+card.cardIndex][+playerIndex] = true;

        //Mark other players as not having card
        _.forEach(this.getAllOtherPlayers(player), (p) => {
            this.markCardAsNotHadByPlayer(p, card);
        });
    }

    //Mark card as not had by player passed in, verifying that the status isn't already set differently
    markCardAsNotHadByPlayer(player: Player, card : Card) : void
    {
        let playerIndex = this.findPlayerIndex(player);

        this.ensureCardIsNotMarkedDifferentlyAlready(player, card, false);

        //Mark card as not had for this player
        this.sheet[card.category][+card.cardIndex][+playerIndex] = false;
    }

    //Get all other players to operate on except the excluded player passsed in
    private getAllOtherPlayers(playerToExclude : Player) : Player[]
    {
        return _.filter(this.players, (p) => { return !_.isEqual(p, playerToExclude);});
    }

    //Create empty sheet with all card/player status as unknown
    private fillOutBlankSheet(players : Player[]) : void
    {
        this.sheet[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(players.length, _.constant(undefined)); });
        this.sheet[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(players.length, _.constant(undefined)); });
        this.sheet[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(players.length, _.constant(undefined)); });
    }

    //Verify current status is not already differently than what is about to be set
    private ensureCardIsNotMarkedDifferentlyAlready(player : Player, card : Card, statusToSet : Boolean) : void
    {
        let currentStatus = this.doesPlayerHaveCard(player, card);
        if (currentStatus != undefined && currentStatus != statusToSet)
            throw new Error("Card status has already been set differently");
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