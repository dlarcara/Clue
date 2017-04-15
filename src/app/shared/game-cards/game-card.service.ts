import { Injectable } from '@angular/core';

import { CardCategory } from '../../game/index';
import { GameCard } from './game-card.model';

import * as _ from 'lodash';

@Injectable()

export class GameCardService
{
    private readonly baseIconLocation = 'assets/img/cards';
    private readonly suspectIconLocation = `${this.baseIconLocation}/suspects`;
    private readonly weaponIconLocation = `${this.baseIconLocation}/weapons`;
    private readonly roomIconLocation = `${this.baseIconLocation}/rooms`;

    private readonly ALLCARDS = [
        new GameCard(CardCategory.SUSPECT, 0, 'Mr. Green', `${this.suspectIconLocation}/green.png`),
        new GameCard(CardCategory.SUSPECT, 1, 'Colonel Mustard', `${this.suspectIconLocation}/mustard.png`),
        new GameCard(CardCategory.SUSPECT, 2, 'Mrs. Peacock', `${this.suspectIconLocation}/peacock.png`),
        new GameCard(CardCategory.SUSPECT, 3, 'Professor Plum', `${this.suspectIconLocation}/plum.png`),
        new GameCard(CardCategory.SUSPECT, 4, 'Mrs. Scarlet', `${this.suspectIconLocation}/scarlet.png`),
        new GameCard(CardCategory.SUSPECT, 5, 'Mrs. White', `${this.suspectIconLocation}/white.png`),
        new GameCard(CardCategory.WEAPON, 0, 'Candlestick', `${this.weaponIconLocation}/candlestick.png`),
        new GameCard(CardCategory.WEAPON, 1, 'Knife', `${this.weaponIconLocation}/knife.png`),
        new GameCard(CardCategory.WEAPON, 2, 'Lead Pipe', `${this.weaponIconLocation}/leadpipe.png`),
        new GameCard(CardCategory.WEAPON, 3, 'Revolver', `${this.weaponIconLocation}/revolver.png`),
        new GameCard(CardCategory.WEAPON, 4, 'Rope', `${this.weaponIconLocation}/rope.png`),
        new GameCard(CardCategory.WEAPON, 5, 'Wrench', `${this.weaponIconLocation}/wrench.png`),
        new GameCard(CardCategory.ROOM, 0, 'Ballroom', `${this.roomIconLocation}/ballroom.png`),
        new GameCard(CardCategory.ROOM, 1, 'Billiard Room', `${this.roomIconLocation}/billiard.png`),
        new GameCard(CardCategory.ROOM, 2, 'Conservatory', `${this.roomIconLocation}/conservatory.png`),
        new GameCard(CardCategory.ROOM, 3, 'Dining Room', `${this.roomIconLocation}/dining.png`),
        new GameCard(CardCategory.ROOM, 5, 'Hall', `${this.roomIconLocation}/hall.png`),
        new GameCard(CardCategory.ROOM, 6, 'Kitchen', `${this.roomIconLocation}/kitchen.png`),
        new GameCard(CardCategory.ROOM, 7, 'Library', `${this.roomIconLocation}/library.png`),
        new GameCard(CardCategory.ROOM, 8, 'Lounge', `${this.roomIconLocation}/lounge.png`),
        new GameCard(CardCategory.ROOM, 9, 'Stucy', `${this.roomIconLocation}/study.png`)
    ];

    getCardsByCategory(cardCategory : CardCategory) : GameCard[]
    {
        return _.filter(this.ALLCARDS, (c) => { return c.cardCategory == cardCategory; });
    }
}