import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameHomePage, GameSheetPage, GameDetailsPage } from './index';

import { GameDetails } from '../../app/shared/index';
import { GameTracker } from '../../app/game/index';

import * as _ from "lodash";

@Component({
    templateUrl: 'game-tabs.page.html'
})

export class GameTabsPage {
    //Tabs
    gameHome: any;
    gameSheet: any;
    gameDetails: any;

    tabParams: any;
    gameTracker: GameTracker

    constructor(private navParams : NavParams) {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;
        this.gameDetails = GameDetailsPage;
        
        if (this.navParams.get('gameDetails'))
        {
            //Bulid game from saved data
            let gameDetails : GameDetails = this.navParams.get('gameDetails');
            let gameTracker = new GameTracker(gameDetails.players, gameDetails.detectivesCards);
            _.forEach(gameDetails.turns, (turn) => {
                gameTracker.enterTurn(turn.player, turn.guess);
            });

            this.gameTracker = gameTracker;
            this.tabParams = { gameTracker: this.gameTracker, activePlayer: gameDetails.activePlayer };
        }
        else
        {
            let detectivesCards = navParams.get('detectivesCards');
            let players = navParams.get('players');

            this.gameTracker = new GameTracker(players, detectivesCards);
            this.tabParams = { gameTracker: this.gameTracker };
        }
    }
}