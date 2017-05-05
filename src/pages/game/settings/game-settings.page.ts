import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { SetupPage } from "../../index"; 
import { GameTabsPage } from "../index"; 
import { GameTracker, Player, CardCategory, Card } from "../../../app/game/index";
import { GameLoaderService, GameCardService } from "../../../app/shared/index";

@Component({
    selector: 'game-settings-page',
    templateUrl: 'game-settings.page.html'
})

export class GameSettingsPage
{
    selectedCategory : number
    players: Player[]

    CardCategory = CardCategory

    constructor(private navController : NavController, private navParams : NavParams, private gameLoaderService : GameLoaderService,
        private gameCardService : GameCardService)
    {
        this.players = this.navParams.get('gameTracker').players;
        this.selectedCategory = 4;
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

    getCardsForCategory(cardCategory : CardCategory): Card[]
    {
        return this.gameCardService.getCardsByCategory(cardCategory);
    }
}