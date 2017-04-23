import { Component } from '@angular/core';

import { GameHomePage, GameSheetPage } from '../index';

@Component({
    templateUrl: 'game-tabs.page.html'
})

export class GameTabsPage {
    gameHome: any;
    gameSheet: any;

    constructor() {
        this.gameHome = GameHomePage;
        this.gameSheet = GameSheetPage;
    }
}