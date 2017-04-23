import { Injectable } from '@angular/core';

import { CardCategory, Card } from '../../game/index';
import { GameCard } from './game-card.model';

import * as _ from 'lodash';

@Injectable()

export class GameCardService
{
    private readonly baseIconLocation = 'assets/img/cards';
    private readonly suspectIconLocation = `${this.baseIconLocation}/suspects`;
    private readonly weaponIconLocation = `${this.baseIconLocation}/weapons`;
    private readonly roomIconLocation = `${this.baseIconLocation}/rooms`;

    readonly ALLCARDS = [
        new GameCard(CardCategory.SUSPECT, 5, 'Mr. Green', `${this.suspectIconLocation}/green.png`),
        new GameCard(CardCategory.SUSPECT, 4, 'Colonel Mustard', `${this.suspectIconLocation}/mustard.png`),
        new GameCard(CardCategory.SUSPECT, 0, 'Mrs. Peacock', `${this.suspectIconLocation}/peacock.png`),
        new GameCard(CardCategory.SUSPECT, 3, 'Professor Plum', `${this.suspectIconLocation}/plum.png`),
        new GameCard(CardCategory.SUSPECT, 1, 'Mrs. Scarlet', `${this.suspectIconLocation}/scarlet.png`),
        new GameCard(CardCategory.SUSPECT, 2, 'Mrs. White', `${this.suspectIconLocation}/white.png`),
        new GameCard(CardCategory.WEAPON, 2, 'Candlestick', `${this.weaponIconLocation}/candlestick.png`),
        new GameCard(CardCategory.WEAPON, 5, 'Knife', `${this.weaponIconLocation}/knife.png`),
        new GameCard(CardCategory.WEAPON, 4, 'Lead Pipe', `${this.weaponIconLocation}/leadpipe.png`),
        new GameCard(CardCategory.WEAPON, 0, 'Revolver', `${this.weaponIconLocation}/revolver.png`),
        new GameCard(CardCategory.WEAPON, 1, 'Rope', `${this.weaponIconLocation}/rope.png`),
        new GameCard(CardCategory.WEAPON, 3, 'Wrench', `${this.weaponIconLocation}/wrench.png`),
        new GameCard(CardCategory.ROOM, 6, 'Ballroom', `${this.roomIconLocation}/ballroom.png`),
        new GameCard(CardCategory.ROOM, 8, 'Billiard Room', `${this.roomIconLocation}/billiardroom.png`),
        new GameCard(CardCategory.ROOM, 3, 'Conservatory', `${this.roomIconLocation}/conservatory.png`),
        new GameCard(CardCategory.ROOM, 0, 'Dining Room', `${this.roomIconLocation}/diningroom.png`),
        new GameCard(CardCategory.ROOM, 2, 'Hall', `${this.roomIconLocation}/hall.png`),
        new GameCard(CardCategory.ROOM, 1, 'Kitchen', `${this.roomIconLocation}/kitchen.png`),
        new GameCard(CardCategory.ROOM, 4, 'Library', `${this.roomIconLocation}/library.png`),
        new GameCard(CardCategory.ROOM, 5, 'Lounge', `${this.roomIconLocation}/lounge.png`),
        new GameCard(CardCategory.ROOM, 7, 'Study', `${this.roomIconLocation}/study.png`)
    ];

    getAllCards() : GameCard[]
    {
        return this.ALLCARDS;
    }

    getCardsByCategory(cardCategory : CardCategory) : GameCard[]
    {
        return _.filter(this.ALLCARDS, (c) => { return c.cardCategory == cardCategory; });
    }

    getCard(cardCategory : CardCategory, cardIndex : number) : GameCard
    {
        return _.find(this.ALLCARDS, (c) => { return c.cardCategory == cardCategory && c.cardIndex == cardIndex; });
    }

    convertToCard(cardCategory : CardCategory, cardIndex : number) : Card
    {
        return new Card(cardCategory, cardIndex);
    }

    groupAllCardsByCategory() : any[]
    {
        return _.chain(this.ALLCARDS)
                .groupBy('cardCategory')
                .toPairs()
                .map(item => _.zipObject(['category', 'cards'], item))
                .map((item : {category, cards}) =>  { return {category: "Suspect", cards: item.cards }; })
                .value();
    }
}