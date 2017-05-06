import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameHomePage, GameSheetPage, GameDetailsPage, GameSettingsPage } from './index';

import { GameDetails } from '../../app/shared/index';
import { GameTracker } from '../../app/game/index';

import * as _ from "lodash";

@Component({
    templateUrl: 'game-tabs.page.html'
})

export class GameTabsPage {
    gameHome: any;
    gameSheet: any;
    gameDetails: any;
    gameSettings : any;
    
    constructor(private navParams : NavParams, private gameTracker : GameTracker) {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;
        this.gameDetails = GameDetailsPage;
        this.gameSettings = GameSettingsPage;

        let gameDetails : GameDetails = this.navParams.get('gameDetails');
        if (gameDetails)
        {
            //Replay Game
            this.gameTracker.startGame(gameDetails.players, gameDetails.detectivesCards);
            this.gameTracker.replayTurns(gameDetails.turns);
        }
        else
        {
            //Start Fresh Game
            gameTracker.startGame(navParams.get('players'), navParams.get('detectivesCards'));
        }
    }
}