import { GameConstants, CardCategory, Suspect, Weapon, Room } from '../index';

export class Card
{
    category: CardCategory
    cardIndex: Number

    get friendlyName() : string { return GameConstants.getCardFriendlyName(this); }
    get icon() : string { return GameConstants.getCardIcon(this); }

    constructor(category : CardCategory, cardIndex : number)
    {
        this.category = category;
        this.cardIndex = cardIndex;
    }
}