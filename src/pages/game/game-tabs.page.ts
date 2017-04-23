import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameHomePage, GameSheetPage } from './index';

import { GameTracker } from '../../app/game/index';

@Component({
    templateUrl: 'game-tabs.page.html'
})

export class GameTabsPage {
    //Tabs
    gameHome: any;
    gameSheet: any;

    tabParams: any;
    gameTracker: GameTracker

    constructor(private navParams : NavParams) {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;

        let detectivesCards = navParams.get('detectivesCards');
        let players = navParams.get('players');

        this.gameTracker = new GameTracker(players, detectivesCards);
        this.tabParams = { gameTracker: this.gameTracker};
    }
}