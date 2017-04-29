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

    CardCategory = CardCategory;

    constructor(private navParams : NavParams, private gameCardService : GameCardService)
    {
        this.gameTracker = navParams.get('gameTracker');
    }

    getTurns() : Turn[]
    {
        return _.orderBy(this.gameTracker.turns, 'number', 'desc');
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