import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameHomePage, GameSheetPage, GameDetailsPage, GameSettingsPage } from './index';

import { GameDetails, GameLoaderService } from '../../app/shared/index';
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
    gameSettings : any;
    
    tabParams: any;
    gameTracker: GameTracker

    constructor(private navParams : NavParams, private gameLoader : GameLoaderService) {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;
        this.gameDetails = GameDetailsPage;
        this.gameSettings = GameSettingsPage;

        if (this.navParams.get('gameDetails'))
        {
            //Bulid game from saved data
            let gameDetails : GameDetails = this.navParams.get('gameDetails');
            this.gameTracker = gameLoader.replayGame(gameDetails);
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