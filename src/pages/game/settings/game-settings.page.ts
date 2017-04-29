import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { SetupPage } from "../../index"; 
import { GameTabsPage } from "../index"; 
import { GameTracker } from "../../../app/game/index";
import { GameLoaderService } from "../../../app/shared/index";

@Component({
    selector: 'game-settings-page',
    templateUrl: 'game-settings.page.html'
})

export class GameSettingsPage
{
    constructor(private navController : NavController, private navParams : NavParams, private gameLoaderService : GameLoaderService)
    {
        
    }

    startNewGame() : void
    {
        this.gameLoaderService.removeGame();
        this.navController.parent.parent.setRoot(SetupPage);
    }

    restartGame() : void 
    {
        let gameTracker : GameTracker = this.navParams.get('gameTracker');
        let params = { players: gameTracker.players, detectivesCards: gameTracker.detectiveCards }
        this.navController.parent.parent.setRoot(GameTabsPage, params);
    }
}