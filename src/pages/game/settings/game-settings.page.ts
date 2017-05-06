import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { SetupPage } from "../../index"; 
import { GameTabsPage } from "../index"; 
import { GameTracker, Player, CardCategory, Card } from "../../../app/game/index";
import { GameLoaderService, GameCardService, GameDetails } from "../../../app/shared/index";

@Component({
    selector: 'game-settings-page',
    templateUrl: 'game-settings.page.html'
})

export class GameSettingsPage
{
    selectedCategory : number
    players: Player[]

    CardCategory = CardCategory

    constructor(private navController : NavController, private gameLoaderService : GameLoaderService, 
                private gameTracker : GameTracker, private gameCardService : GameCardService)
    {
        this.players = gameTracker.players;
        this.selectedCategory = 4;
    }

    startNewGame() : void
    {
        this.gameLoaderService.removeGame();
        this.navController.parent.parent.setRoot(SetupPage);
    }

    restartGame() : void 
    {
        let gameDetails = new GameDetails(this.gameTracker.players, this.gameTracker.detectiveCards, [], this.gameTracker.useOrchid);
        this.navController.parent.parent.setRoot(GameTabsPage, { gameDetails: gameDetails });
    }

    getCardsForCategory(cardCategory : CardCategory): Card[]
    {
        return this.gameCardService.getCardsByCategory(cardCategory);
    }
}