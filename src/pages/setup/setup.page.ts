import { Component, Inject } from '@angular/core';

import { NavController, reorderArray } from 'ionic-angular';

import { CardCategory } from '../../app/game/index';
import { GameCardService, GameCard } from '../../app/shared/index';

import * as _ from 'lodash';    

@Component({
    selector: 'setup-page',
    templateUrl: 'setup.page.html'
})

export class SetupPage {
    players: any[];
    setupStep: number;

    CardCategory = CardCategory;

    private allCardsByCategory: any[] //Game Cards grouped by category

    constructor(private gameCardService : GameCardService) {}

    ionViewDidLoad()
    {
        this.setupStep = 1;        
        this.allCardsByCategory = this.gameCardService.groupAllCardsByCategory();

        //Default template for players
        this.players = _.map(this.allCardsByCategory[CardCategory.SUSPECT].cards, (suspect, index) => {
            return { isDetective: index == 0, name: '', suspect: suspect, isPlaying: index < 3, extraCard: false }
        });
    }

    getPlayersToDisplayBasedOnSetupStep(setupStep) : any[]
    {
        return _.filter(this.players, (player) => setupStep == 1 ? true : player.isPlaying);
    }

    reorderItems(indexes) : void {
        this.players = reorderArray(this.players, indexes);
    }
}