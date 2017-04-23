import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameHomePage, GameSheetPage } from './index';

@Component({
    templateUrl: 'game-tabs.page.html'
})

export class GameTabsPage {
    //Tabs
    gameHome: any;
    gameSheet: any;

    homeTabParams: any;

    constructor(private navParams : NavParams) {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;

        let detective = navParams.get('detective');
        let detectivesCards = navParams.get('detectivesCards');
        let players = navParams.get('players');

        this.homeTabParams = { detective: detective, players: players, detectivesCards: detectivesCards};
    }
}