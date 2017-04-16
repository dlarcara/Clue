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
    setupStep: string;
    detective: any;
    players: any[];
    allCardsByCategory: any[] //Game Cards grouped by category
    selectedCards: any[]

    CardCategory = CardCategory;

    constructor(private gameCardService : GameCardService) {}

    ionViewDidLoad()
    {
        this.setupStep = "1";  
        this.allCardsByCategory = this.gameCardService.groupAllCardsByCategory();

        //Default template for players
        this.players = _.map(this.allCardsByCategory[CardCategory.SUSPECT].cards, (suspect, index) => {
            return { name: '', suspect: suspect, isPlaying: index < 3, extraCard: false, cards: [] }
        });
        this.detective = this.players[0]; //Default the detective to first player
    }

    getPlayersToDisplayBasedOnSetupStep(setupStep) : any[]
    {
        return setupStep == 1 ? this.players : this.getPlayingPlayers();
    }

    getPlayingPlayers() : any[]
    {
        return _.filter(this.players, 'isPlaying');
    }

    reorderItems(indexes) : void {
        this.players = reorderArray(this.players, indexes);
    }

    playerIsDetective(player) : Boolean
    {
        return _.isEqual(player, this.detective);
    }

    getNumberOfCardsForPlayer(player : any)
    {
        let numberOfCards = Math.floor(18 / this.getPlayingPlayers().length);
        if (player.extraCard) numberOfCards++;
        return numberOfCards;
    }

    //Step 1 Validation
    isStep1Valid = () : Boolean => this.isPlayerCountValid() && this.arePlayerNamesValid();

    isPlayerCountValid = () : Boolean => (this.getPlayingPlayers().length >= 3);
    arePlayerNamesValid = () : Boolean => (_.every(this.getPlayingPlayers(), 'name'));

    //Step 2 Validation
    isStep2Valid = () : Boolean => this.isStep1Valid() && this.areExtraCardsIdentified();
    getNumberOfExtraCards = () : number => 18 % this.getPlayingPlayers().length;
    getPlayersWithExtraCard = () : number => _.filter(this.players, 'extraCard').length;
    areExtraCardsIdentified = () : Boolean => this.getPlayersWithExtraCard() == this.getNumberOfExtraCards();
    shouldShowExtraCardValidation = () : Boolean => (this.setupStep == "2" || this.setupStep == "4") && this.getNumberOfExtraCards() !=0;
    getPlayerOrderDisplay = () : string => this.getPlayingPlayers().map((item) => item.name).join(", ");

    //Step 3 Validation
    isStep3Valid = () : Boolean => this.isStep2Valid() && this.allDetectivesCardsSelected();
    allDetectivesCardsSelected = () : Boolean => this.getSelectedCards().length == this.getNumberOfCardsForPlayer(this.detective);
    getSelectedCards() : any[]
    {
        if (!this.allCardsByCategory) return [];

        return _.filter(this.allCardsByCategory[0].cards, 'selected')
                        .concat(_.filter(this.allCardsByCategory[1].cards, 'selected'))
                        .concat(_.filter(this.allCardsByCategory[2].cards, 'selected'));
    }
}