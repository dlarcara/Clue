import { CardCategory } from '../index';

export class Card
{
    category: CardCategory
    cardIndex: Number

    constructor(category : CardCategory, cardIndex : number)
    {
        this.category = category;
        this.cardIndex = cardIndex;
    }
}