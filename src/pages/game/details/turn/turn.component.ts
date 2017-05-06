import { Component, Input } from '@angular/core';

import { NavController } from 'ionic-angular';

import { GameTracker, CardCategory, Turn, Player, Card, Guess, CellStatus, CellData } from '../../../../app/game/index';
import { GameCardService } from '../../../../app/shared/index';
import { LessonsLearnedForPlayer } from '../lesson-learned-for-player.model';
import { EditTurnPage } from './edit-turn.page';

import * as _ from "lodash";

@Component({
    selector: 'turn-component',
    templateUrl: 'turn.component.html'
})

export class TurnComponent
{
    @Input() turn: Turn
    @Input() gameTracker: GameTracker
    @Input() useGuessTracking : Boolean
    @Input() useLessonsLearned : Boolean

    CardCategory = CardCategory;
    CellStatus = CellStatus;

    constructor(private gameCardService : GameCardService, private navCtrl: NavController) {}

    getCardDisplay(cardCategory : CardCategory, cardIndex : number) : string
    {
        return this.gameCardService.getCard(cardCategory, cardIndex).friendlyName;
    }

    getPlayerDisplay(player : Player) : string
    {
        return this.playerIsDetective(player) ? "You" : player.name;
    }

    playerIsDetective(player : Player) : Boolean
    {
        return _.isEqual(player, this.gameTracker.getDetective())
    }

    shouldShowTurnResolution(turn : Turn) : Boolean
    {
        if (!turn.guess)
            return false;

        if (this.playerIsDetective(turn.player) || this.playerIsDetective(turn.guess.playerThatShowed))
            return false;

        return true;
    }

    getTotalNumberOfLessonsLearnedFromTurn(turn : Turn) : number
    {
        let lessonsLearned = this.getLessonsLearnedFromTurn(turn);
        return _.sumBy(lessonsLearned, (ll : LessonsLearnedForPlayer) => ll.cardsHad.length + ll.cardsNotHad.length);
    }

    getLessonsLearnedFromTurn(turn : Turn) : LessonsLearnedForPlayer[]
    {
        let lessonsLearned = [];

        _.forEach(this.gameTracker.players, (player : Player) => {
            let cardsHad = turn.resultingSheet.getAllEntriesForPlayerAndTurnAndStatus(player, turn.number, CellStatus.HAD);
            let cardsNotHad = turn.resultingSheet.getAllEntriesForPlayerAndTurnAndStatus(player, turn.number, CellStatus.NOTHAD);

            if (cardsHad.length || cardsNotHad.length)
                lessonsLearned.push(new LessonsLearnedForPlayer(player, cardsHad, cardsNotHad));
        })

        return lessonsLearned;
    }

    getCardByCategory(guess : Guess, cardCategory : CardCategory) : Card
    {
        switch(cardCategory)
        {
            case CardCategory.SUSPECT: return new Card(CardCategory.SUSPECT, guess.suspect);
            case CardCategory.WEAPON: return new Card(CardCategory.WEAPON, guess.weapon);
            case CardCategory.ROOM: return new Card(CardCategory.ROOM, guess.room);
        }
    }

    getDataForPlayerAndCard(guess : Guess, cardCategory : CardCategory) : CellData
    {
        let card = this.getCardByCategory(guess, cardCategory);
        return this.gameTracker.getCellDataForPlayerAndCard(guess.playerThatShowed, card);
    }

    editTurn(turn : Turn) : void
    {
        this.navCtrl.push(EditTurnPage, { 
            turn: turn,
            gameTracker: this.gameTracker
        });
    }

    getCardMessage(guess : Guess, cardCategory : CardCategory) : string
    {
        let card = this.getCardByCategory(guess, cardCategory);
        let cellData = this.getDataForPlayerAndCard(guess, cardCategory);

        if (cellData.status == CellStatus.HAD)
            return `Identified as had by ${guess.playerThatShowed.numberOfCards} in turn #${cellData.enteredTurn}`;

        if (cellData.status == CellStatus.NOTHAD)
            return `Identified as not had by ${guess.playerThatShowed.numberOfCards} in turn #${cellData.enteredTurn}`;

        return `Status of card unknown for ${guess.playerThatShowed.numberOfCards}`;
    }
}