import { CardCategory, Suspect, Weapon, Room } from '../index';

export class Card
{
    category: CardCategory
    cardIndex: Number

    constructor(category : CardCategory, cardIndex : number)
    {
        this.category = category;
        this.cardIndex = cardIndex;
    }

    getFriendlyDisplay() : string
    {
        switch(this.category)
        {
            case CardCategory.SUSPECT:
                return Suspect[+this.cardIndex];
            case CardCategory.WEAPON:
                return Weapon[+this.cardIndex];
            case CardCategory.ROOM:
                return Room[+this.cardIndex];
        }
    }
}