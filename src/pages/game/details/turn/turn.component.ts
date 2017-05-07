import { Component, Input } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';

import { GameTracker, CardCategory, Turn, Player, Card, CellStatus, CellData } from '../../../../app/game/index';
import { GameCardService } from '../../../../app/shared/index';
import { EditTurnPage } from './edit-turn.page';

import * as _ from "lodash";

@Component({
    selector: 'turn-component',
    templateUrl: 'turn.component.html'
})

export class TurnComponent
{
    @Input() turn: Turn
    @Input() useGuessTracking : Boolean
    @Input() useLessonsLearned : Boolean

    CardCategory = CardCategory;
    CellStatus = CellStatus;

    constructor(private gameCardService : GameCardService, private navCtrl: NavController, private gameTracker : GameTracker,
                private alertController : AlertController) {}

    getCardDisplay(cardCategory : CardCategory, cardIndex : number) : string
    {
        return this.gameCardService.getCard(cardCategory, cardIndex).friendlyName;
    }

    getPlayerDisplay(player : Player) : string
    {
        return player.isDetective ? "You" : player.name;
    }

    shouldShowTurnResolution() : Boolean
    {
        if (this.turn.player.isDetective || !this.turn.guess || !this.turn.guess.playerThatShowed || this.turn.guess.playerThatShowed.isDetective)
            return false;

        return true;
    }

    getPlayerAndCardData(player : Player, card : Card) : CellData
    {
        return this.gameTracker.getActiveTurn().resultingSheet.getCellDataForPlayerAndCard(player, card);
    }

    showGuessMessage(player : Player, card : Card) : void 
    {
        let message = '';
        let cellData = this.getPlayerAndCardData(player, card);

        if (cellData.status == CellStatus.UNKNOWN)
            message =  `Status of card unknown for ${player.name}`;
        else
            message = `Identified as ${cellData.status == CellStatus.HAD ? 'had' : 'not had' } by ${player.name} in turn #${cellData.enteredTurn}`;
        
        let alert = this.alertController.create({title: card.friendlyName, subTitle: message });
        alert.present();
    }

    getTotalNumberOfLessonsLearnedFromTurn() : number
    {
        return _.sumBy(this.turn.lessonsLearned.lessonsLearnedForPlayers, (ll) => ll.cardsHad.length + ll.cardsNotHad.length);
    }

    getLessonsLearnedFromTurn() : any
    {
        return _.filter(this.turn.lessonsLearned.lessonsLearnedForPlayers, (ll) => ll.cardsHad.length || ll.cardsNotHad.length);
    }

    noLessonsLearned() : Boolean
    {
        return this.getTotalNumberOfLessonsLearnedFromTurn() == 0 && !this.turn.lessonsLearned.identifiedSuspect &&
                !this.turn.lessonsLearned.identifiedWeapon && !this.turn.lessonsLearned.identifiedRoom && 
                !this.turn.lessonsLearned.resolvedTurns.length;
    }

    getMultipleResolvedTurnDisplay() : string
    {
        return this.turn.lessonsLearned.resolvedTurns.map((n) => `<span class="display-value">#${n}</span>`).join(', ');
    }
    
    editTurn() : void
    {
        this.navCtrl.push(EditTurnPage, { 
            turn: this.turn,
            gameTracker: this.gameTracker
        });
    }
}