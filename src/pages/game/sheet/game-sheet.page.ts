import { Component } from '@angular/core';

import { NavParams, AlertController } from 'ionic-angular';

import { GameCardService } from '../../../app/shared/index';
import { GameTracker, Player, Card, CardCategory, CellStatus, Verdict } from '../../../app/game/index';

import * as _ from "lodash";

@Component({
    selector: 'game-sheet-page',
    templateUrl: 'game-sheet.page.html'
})

export class GameSheetPage {
    readonly suspectCards: Card[]
    readonly weaponCards: Card[]
    readonly roomCards: Card[]

    gameTracker : GameTracker

    constructor(private navParams : NavParams, private gameCardService : GameCardService, private alertCtrl: AlertController) 
    {
        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);

        this.gameTracker = this.navParams.get('gameTracker');
    }

    getCellClass(player : Player, card: Card) : string
    {
        let cellStatus = this.gameTracker.getStatusForPlayerAndCard(player, card);
        
        if (cellStatus == CellStatus.HAD)
            return 'card-had';

        if (cellStatus == CellStatus.NOTHAD)
            return 'card-not-had';

        if(this.gameTracker.playerMightHaveCard(player, card))
            return "card-maybe";
        
        return 'card-unknown';
    }

    getVerdict() : any
    {
        let verdict = this.gameTracker.getVerdict();
        
        return {
            suspect: verdict ? this.gameCardService.getCard(CardCategory.SUSPECT, verdict.suspect) : null,
            weapon: verdict ? this.gameCardService.getCard(CardCategory.WEAPON, verdict.weapon) : null,
            room: verdict ? this.gameCardService.getCard(CardCategory.ROOM, verdict.room) : null,
        }
    }

    showPlayerDetails(player) : void
    {
        let knownCards = this.gameTracker.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);

        let alert = this.alertCtrl.create({
            title: _.isEqual(this.gameTracker.getDetective(), player) ? "You" : player.name,
            subTitle: `${knownCards.length}/${player.numberOfCards} cards identified`,
            buttons: ['Dismiss']
        });
        alert.present();
    }

    showCardDetails(card : Card) : void
    {
        let playerWhoHasCard = this.gameTracker.getPlayerWhoHasCard(card);
        let youHaveCard = _.isEqual(this.gameTracker.getDetective(), playerWhoHasCard);

        let message = playerWhoHasCard ? 
            `Had by ${youHaveCard ? "You" : playerWhoHasCard.name}` : 
            'Owner not identified';

        let alert = this.alertCtrl.create({
            title: card.friendlyName,
            subTitle: message,
            buttons: ['Dismiss']
        });
        alert.present();
    }

    showVerdict(card : Card) : void
    {
        let alert = this.alertCtrl.create({
            title: card.friendlyName,
            buttons: ['Dismiss']
        });
        alert.present();
    }
}