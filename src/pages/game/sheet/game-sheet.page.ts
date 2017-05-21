import { Component, ViewChild  } from '@angular/core';

import { Content } from 'ionic-angular';

import { GameCardService } from '../../../app/shared/index';
import { GameTracker, Player, Card, CardCategory, CellStatus, Turn } from '../../../app/game/index';

import * as _ from "lodash";

@Component({
    selector: 'game-sheet-page',
    templateUrl: 'game-sheet.page.html'
})

export class GameSheetPage {
    readonly suspectCards: Card[]
    readonly weaponCards: Card[]
    readonly roomCards: Card[]

    showTurnSlide: Boolean
    showVerdict: Boolean

    displayedTurnNumber : number
    displayedTurn: Turn

    @ViewChild(Content) content: Content;

    constructor(private gameCardService : GameCardService, private gameTracker : GameTracker) 
    {
        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);

        this.showTurnSlide = false;
        this.showVerdict = true;

        this.resetTurnDisplay();
    }

    resetTurnDisplay() : void 
    {
        this.displayedTurnNumber = this.gameTracker.getActiveTurn().number;
        this.displayedTurn = this.gameTracker.getActiveTurn();
    }

    onShownTurnSlideChange() : void 
    {
        if (!this.showTurnSlide)
            this.resetTurnDisplay();
    }

    onDisplayedTurnChange() : void 
    {
        this.displayedTurn = this.gameTracker.turns[this.displayedTurnNumber];
    }

    isNextPlayer(player : Player) : Boolean
    {
        return _.isEqual(this.gameTracker.getNextPlayer(this.displayedTurn.player), player);
    }

    getCellClass(player : Player, card: Card) : string
    {
        let gameSheet = this.displayedTurn.resultingSheet;
        let cellStatus = gameSheet.getStatusForPlayerAndCard(player, card);
        
        if (cellStatus == CellStatus.HAD)
            return 'card-had';

        if (cellStatus == CellStatus.NOTHAD)
            return 'card-not-had';

        return 'card-unknown';
    }

    cardIsBeingTracked(player : Player, card : Card) : Boolean
    {
        let gameSheetForActiveTurn = this.displayedTurn.resultingSheet;
        return _.some(this.displayedTurn.lessonsLearned.unresolvedTurns, (turnNumber : number) => {
            let turn = this.gameTracker.turns[turnNumber];

            if(!_.isEqual(turn.guess.playerThatShowed, player))
                return false;

            if (card.category == CardCategory.SUSPECT && turn.guess.suspect == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;
            
            if (card.category == CardCategory.WEAPON && turn.guess.weapon == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;

            if (card.category == CardCategory.ROOM && turn.guess.room == card.cardIndex)
                return gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;

            return false;
        });
    }

    getPlayerMessage(player) : string
    {
        let gameSheet = this.displayedTurn.resultingSheet;
        let knownCards = gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);

        return `${knownCards.length}/${player.numberOfCards} cards identified`;
    }

    getCardMessage(card : Card) : string
    {
        let gameSheet = this.displayedTurn.resultingSheet;
        let playerWhoHasCard = gameSheet.getPlayerWhoHasCard(card);
        let youHaveCard = _.isEqual(this.gameTracker.getDetective(), playerWhoHasCard);

        return playerWhoHasCard ? 
            `Had by ${youHaveCard ? "You" : playerWhoHasCard.name}` : 
            'Owner not identified';
    }
}