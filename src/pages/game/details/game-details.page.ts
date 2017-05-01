import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameTracker, CardCategory, Turn, Player, Card } from '../../../app/game/index';
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
    filterShowOnlyUnresolvedGuesses: Boolean
    filterPlayer: Player

    suspectCards: Card[]
    weaponCards: Card[]
    roomCards: Card[]

    CardCategory = CardCategory;

    constructor(private navParams : NavParams, private gameCardService : GameCardService)
    {
        //Set Default Filter Values;
        this.showFilters = false;
        this.filterDoNotShowPasses = false;
        this.filterShowOnlyUnresolvedGuesses = false;
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
}