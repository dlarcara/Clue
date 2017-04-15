import { CardCategory } from '../../game/index';

export class CardDefinition
{
    constructor(public cardCategory : CardCategory, public cardIndex : number, public friendlyName : string, public icon : string)
    {

    }
}