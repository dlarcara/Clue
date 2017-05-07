import { Component, ViewChild  } from '@angular/core';

import { Content } from 'ionic-angular';

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

    displayedTurn : number
    showTurnSlide : Boolean
    showVerdict : Boolean

    @ViewChild(Content) content: Content;

    constructor(private gameCardService : GameCardService, private gameTracker : GameTracker) 
    {
        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);

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
        this.displayedTurn = (this.gameTracker.turns.length);
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
        if (this.displayedTurn == this.gameTracker.turns.length)
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

    cardIsBeingTracked(player : Player, card : Card) : Boolean
    {
        let turns = this.gameTracker.turns.slice(0, this.displayedTurn);
        let gameSheetForActiveTurn = this.getGameSheetForDisplayedTurn();

        return _.some(turns, (t) => {
            if(!t.guess || t.guess.cardShown || _.isEqual(t.guess.playerThatGuessed, this.gameTracker.getDetective()))
                return false;

            if(!_.isEqual(t.guess.playerThatShowed, player))
                return false;

            if (t.guess.resolvedTurn && t.guess.resolvedTurn <= this.displayedTurn)
                return false;

            if (card.category == CardCategory.SUSPECT && t.guess.suspect == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;
            
            if (card.category == CardCategory.WEAPON && t.guess.weapon == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;

            if (card.category == CardCategory.ROOM && t.guess.room == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;
                
            return false;
        });
    }

    getVerdict() : Verdict
    {
        let gameSheet = this.getGameSheetForDisplayedTurn();
        return gameSheet.getVerdict();
    }

    private getGameSheetForDisplayedTurn() : GameSheet
    {
        return this.gameTracker.turns[this.displayedTurn-1].resultingSheet;
    }

    getPlayerMessage(player) : string
    {
        let gameSheet = this.getGameSheetForDisplayedTurn();
        let knownCards = gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);

        return `${knownCards.length}/${player.numberOfCards} cards identified`;
    }

    getCardMessage(card : Card) : string
    {
        let gameSheet = this.getGameSheetForDisplayedTurn();
        let playerWhoHasCard = gameSheet.getPlayerWhoHasCard(card);
        let youHaveCard = _.isEqual(this.gameTracker.getDetective(), playerWhoHasCard);

        return playerWhoHasCard ? 
            `Had by ${youHaveCard ? "You" : playerWhoHasCard.name}` : 
            'Owner not identified';
    }
}