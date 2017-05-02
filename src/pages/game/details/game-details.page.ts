import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameTracker, CardCategory, Turn, Player, Card, Guess, CellStatus } from '../../../app/game/index';
import { GameCardService } from '../../../app/shared/index';

import * as _ from "lodash";

@Component({
    selector: 'game-details-page',
    templateUrl: 'game-details.page.html'
})

export class GameDetailsPage
{
    gameTracker: GameTracker
    
    showFilters: Boolean
    filterDoNotShowPasses: Boolean
    filterShowOnlyUnresolvedTurns: Boolean
    filterPlayer: Player

    suspectCards: Card[]
    weaponCards: Card[]
    roomCards: Card[]

    CardCategory = CardCategory;
    CellStatus = CellStatus;

    constructor(private navParams : NavParams, private gameCardService : GameCardService)
    {
        //Set Default Filter Values;
        this.showFilters = false;
        this.filterDoNotShowPasses = true;
        this.filterShowOnlyUnresolvedTurns = false;
        this.filterPlayer = null;

        this.gameTracker = navParams.get('gameTracker');

        this.suspectCards = gameCardService.getCardsByCategory(CardCategory.SUSPECT);
        this.weaponCards = gameCardService.getCardsByCategory(CardCategory.WEAPON);
        this.roomCards = gameCardService.getCardsByCategory(CardCategory.ROOM);
    }

    getTurns() : Turn[]
    {
        let filteredTurns = _.filter(this.gameTracker.turns, (t : Turn) => {
            if (this.filterDoNotShowPasses && !t.guess)
                return false;
                
            if (this.filterPlayer && !_.isEqual(t.player, this.filterPlayer))
                return false;

            if (this.filterShowOnlyUnresolvedTurns)
            {
                if (!t.guess)
                    return false
                
                if (this.playerIsDetective(t.player) || this.playerIsDetective(t.guess.playerThatShowed))
                    return false;

                if (t.guess.resolvedTurn)
                    return false;
            }

            return true;
        });

        return _.orderBy(filteredTurns, 'number', 'desc');
    }

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

    getCardByCategory(guess : Guess, cardCategory : CardCategory) : Card
    {
        switch(cardCategory)
        {
            case CardCategory.SUSPECT: return new Card(CardCategory.SUSPECT, guess.suspect);
            case CardCategory.WEAPON: return new Card(CardCategory.WEAPON, guess.weapon);
            case CardCategory.ROOM: return new Card(CardCategory.ROOM, guess.room);
        }
    }

    getStatusForCard(guess : Guess, cardCategory : CardCategory) : CellStatus
    {
        let card = this.getCardByCategory(guess, cardCategory);
        return this.gameTracker.getStatusForPlayerAndCard(guess.playerThatShowed, card);
    }
}