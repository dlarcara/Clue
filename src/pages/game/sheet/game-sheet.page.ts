import { Component, ViewChild  } from '@angular/core';

import { NavParams, AlertController, Content } from 'ionic-angular';

import { GameCardService } from '../../../app/shared/index';
import { GameTracker, Player, Card, CardCategory, CellStatus, Verdict, GameSheet } from '../../../app/game/index';

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
    displayedTurn : number
    showTurnSlide : Boolean
    showVerdict : Boolean

    @ViewChild(Content) content: Content;

    constructor(private navParams : NavParams, private gameCardService : GameCardService, private alertCtrl: AlertController) 
    {
        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);

        this.gameTracker = this.navParams.get('gameTracker');
        this.resetFilters();
    }

    ionViewDidEnter() : void
    {
        this.resetFilters();
    }

    private resetFilters() : void
    {
        this.showTurnSlide = false;
        this.showVerdict = true;
        this.displayedTurn = (this.gameTracker.turns.length-1);
    }

    toggleVerdict() : void
    {
        this.showVerdict = !this.showVerdict;
        this.content.resize();
    }

    toggleTurnSlide() : void 
    {
        this.showTurnSlide = !this.showTurnSlide;
        this.content.resize();
    }

    getTurnColor() : string
    {
        if (this.displayedTurn == (this.gameTracker.turns.length - 1))
            return 'valid';

        if ((this.displayedTurn / this.gameTracker.turns.length) > .25)
            return 'warning';

        return 'invalid';
    }

    getCellClass(player : Player, card: Card) : string
    {
        let gameSheet = this.getGameSheetForDisplayedTurn();
        let cellStatus = gameSheet.getStatusForPlayerAndCard(player, card);
        
        if (cellStatus == CellStatus.HAD)
            return 'card-had';

        if (cellStatus == CellStatus.NOTHAD)
            return 'card-not-had';

        return 'card-unknown';
    }

    getVerdict() : any
    {
        let gameSheet = this.getGameSheetForDisplayedTurn();
        let verdict = gameSheet.getVerdict();
        
        return {
            suspect: verdict ? this.gameCardService.getCard(CardCategory.SUSPECT, verdict.suspect) : null,
            weapon: verdict ? this.gameCardService.getCard(CardCategory.WEAPON, verdict.weapon) : null,
            room: verdict ? this.gameCardService.getCard(CardCategory.ROOM, verdict.room) : null,
        }
    }

    private getGameSheetForDisplayedTurn() : GameSheet
    {
        return this.gameTracker.turns[this.displayedTurn].resultingSheet;
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

    showVerdictAlert(card : Card) : void
    {
        let alert = this.alertCtrl.create({
            title: card.friendlyName,
            buttons: ['Dismiss']
        });
        alert.present();
    }
}