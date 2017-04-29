import { Injectable } from '@angular/core';

import { GameConstants, CardCategory, Card } from '../../game/index';

import * as _ from 'lodash';

@Injectable()

export class GameCardService
{
    getAllCards() : Card[]
    {
        return GameConstants.ALLCARDS;
    }

    getCard(cardCategory : CardCategory, cardIndex : number) : Card
    {
        return _.find(GameConstants.ALLCARDS, (c) => { return c.category == cardCategory && c.cardIndex == cardIndex; });
    }

    getCardsByCategory(cardCategory : CardCategory) : Card[]
    {
        return _.filter(GameConstants.ALLCARDS, (c) => { return c.category == cardCategory; });
    }

    groupCardsByCategory(cards : Card[]) : any[]
    {
        return GameConstants.groupCardsByCategory(cards);
    }

    groupAllCardsByCategory() : any[]
    {
        return GameConstants.groupAllCardsByCategory();
    }
}