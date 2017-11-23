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

    ionViewDidEnter() : void 
    {
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

    getUnresolvedGuessDisplayDetails(player : Player, card : Card) : any {
        //Get all unresolved turns for this player      
        let allUnresolvedTurnsForPlayer : Turn[] = _.chain(this.displayedTurn.lessonsLearned.unresolvedTurns)
            .map((turnNumber : number) => { return this.gameTracker.turns[turnNumber]; })
            .filter((turn : Turn) => { return _.isEqual(player, turn.guess.playerThatShowed); })
            .value();
        
        let guessDisplayDetails = [];
        let gameSheetForActiveTurn = this.displayedTurn.resultingSheet;
        
        //Build list of display details based on the total set of unresolved guesses for this player
        _.forEach(allUnresolvedTurnsForPlayer, (turn : Turn, index : number) => {
            //Make sure the card this is for was part of the guess
            if (card.category == CardCategory.SUSPECT && turn.guess.suspect == card.cardIndex ||
                card.category == CardCategory.WEAPON && turn.guess.weapon == card.cardIndex ||
                card.category == CardCategory.ROOM && turn.guess.room == card.cardIndex
            )
            {
                //Make sure the card this is for is in the unknown status for the player this if for
                if (gameSheetForActiveTurn.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN)
                {
                    guessDisplayDetails.push({ index: index, turnNumber: turn.number });
                    index++;
                }
            }
        });

        return guessDisplayDetails;
    }

    getColorClassForIndex(index) : string
    {
        //3 Unique colors are used for guesses, generate a class for one of this based on the index number
        return "guess-color-" + ((index % 3) + 1);
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