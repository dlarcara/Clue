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

    markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //TODO: Throw Exception When working on a player not playing

        if (this.getStatusForPlayerAndCard(player, card) == CellStatus.NOTHAD)
            throw new Error("Cell status has already been set differently");

        this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)] = CellStatus.HAD;
    }

    markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        //TODO: Throw Exception When working on a player not playing

        if (this.getStatusForPlayerAndCard(player, card) == CellStatus.HAD)
            throw new Error("Cell status has already been set differently");

        this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)] = CellStatus.NOTHAD;
    }

    private getPlayerIndex(player : Player) : number
    {
        return _.findIndex(this.players, player);
    }
}