import { CardCategory, Suspect, Weapon, Room, CellStatus, Player, Card } from '../index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameSheet
{
    private players : Player[];
    private cells: any[] = [];

    constructor(players : Player[])
    {
        this.players = players;

        this.cells[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
        this.cells[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
        this.cells[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
    }

    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {
        //TODO: Throw Exception When checking on a player not playing

        return this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)];
    }

    setStatusForPlayerAndCard(player: Player, card : Card, cellStatus : CellStatus) : void
    {
        //TODO: Throw Exception When working on a player not playing
        
        let currentStatus = this.getStatusForPlayerAndCard(player, card);
        if (currentStatus != CellStatus.UNKNOWN && currentStatus != cellStatus)
            throw new Error("Cell status has already been set differently");

        this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)] = cellStatus;
    }

    private getPlayerIndex(player : Player) : number
    {
        return _.findIndex(this.players, player);
    }
}