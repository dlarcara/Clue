import { CardCategory, Suspect, Weapon, Room, CellStatus, Player, Card } from '../index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameSheet
{
    private cells: any[] = [];

    constructor(numberOfPlayers : Number)
    {
        //Create empty sheet with all card/player status as unknown
        this.cells[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(+numberOfPlayers, _.constant(CellStatus.Unknown)); });
        this.cells[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(+numberOfPlayers, _.constant(CellStatus.Unknown)); });
        this.cells[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(+numberOfPlayers, _.constant(CellStatus.Unknown)); });
    }

    getCells() : any[]
    {
        return this.cells;
    }

    getStatusForPlayerAndCard(playerIndex : Number, cardCategoryIndex : Number, cardIndex : Number) : CellStatus
    {
        return this.cells[+cardCategoryIndex][+cardIndex][+playerIndex];
    }

    markCardAsHadByPlayer(playerIndex : Number, cardCategoryIndex : Number, cardIndex : Number) : void
    {
        if (this.getStatusForPlayerAndCard(playerIndex, cardCategoryIndex, cardIndex) == CellStatus.NotHad)
            throw new Error("Cell status has already been set differently");

        this.cells[+cardCategoryIndex][+cardIndex][+playerIndex] = CellStatus.Had;
    }

    markCardAsNotHadByPlayer(playerIndex : Number, cardCategoryIndex : Number, cardIndex : Number) : void
    {
        if (this.getStatusForPlayerAndCard(playerIndex, cardCategoryIndex, cardIndex) == CellStatus.Had)
            throw new Error("Cell status has already been set differently");

        this.cells[+cardCategoryIndex][+cardIndex][+playerIndex] = CellStatus.NotHad;
    }
}