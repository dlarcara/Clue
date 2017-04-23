import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameCardService, GameCard } from '../../../app/shared/index';
import { GameTracker, Player, Card, CardCategory, CellStatus } from '../../../app/game/index';

@Component({
    selector: 'game-sheet-page',
    templateUrl: 'game-sheet.page.html'
})

export class GameSheetPage {
    readonly suspectCards: GameCard[]
    readonly weaponCards: GameCard[]
    readonly roomCards: GameCard[]

    gameTracker : GameTracker
    
    constructor(private navParams : NavParams, private gameCardService : GameCardService) 
    {
        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);

        this.gameTracker = this.navParams.get('gameTracker');
    }

    getCellClass(player : Player, gameCard: GameCard) : string
    {
        let card = new Card(gameCard.cardCategory, gameCard.cardIndex);
        let cellStatus = this.gameTracker.getStatusForPlayerAndCard(player, card);

        switch(cellStatus)
        {
            case CellStatus.HAD: return 'card-had';
            case CellStatus.NOTHAD: return 'card-not-had';
            default: return 'card-unknown';
        }
    }
}