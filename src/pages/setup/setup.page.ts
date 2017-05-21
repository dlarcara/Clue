import { Component } from '@angular/core';

import { NavController, reorderArray } from 'ionic-angular';

import { GameTracker, CardCategory, Player, Card, Suspect } from '../../app/game/index';
import { GameCardService } from '../../app/shared/index';
import { GameTabsPage } from '../game/index';

import * as _ from 'lodash';    

@Component({
    selector: 'setup-page',
    templateUrl: 'setup.page.html'
})

export class SetupPage {
    setupStep: string;
    allCardsByCategory: any[] //Game Cards grouped by category

    detective: any
    players: any[]
    playingPlayers : any[] = []

    useOrchid : Boolean = false

    CardCategory = CardCategory;

    constructor(private navCtrl : NavController, private gameCardService : GameCardService,
                private gameTracker : GameTracker) {}

    ionViewDidLoad()
    {
        this.setupStep = "1";  
        this.allCardsByCategory = this.gameCardService.groupAllCardsByCategory();
        _.forEach(this.allCardsByCategory[CardCategory.SUSPECT].cards, (c) => { c.selected = false; });
        _.forEach(this.allCardsByCategory[CardCategory.WEAPON].cards, (c) => { c.selected = false; });
        _.forEach(this.allCardsByCategory[CardCategory.ROOM].cards, (c) => { c.selected = false; });
        
        //Default template for players
        this.players = _.map(this.allCardsByCategory[CardCategory.SUSPECT].cards, (suspect, index) => {
            return { name: '', suspect: suspect, isPlaying: index < 3, extraCard: false, cards: [] }
        });
        this.playingPlayers = _.cloneDeep(this.players);
    }

    setPlayerAsPlaying(player) : void 
    {
        player.isPlaying = true;
        this.playingPlayerChanged();
    }   
    
    playingPlayerChanged() : void {
        this.playingPlayers = _.filter(this.players, 'isPlaying');
    }

    reorderItems(indexes) : void {
        this.playingPlayers = reorderArray(this.playingPlayers, indexes);
    }

    getNumberOfCardsForPlayer(player : any)
    {
        let numberOfCards = Math.floor(18 / this.playingPlayers.length);
        if (player.extraCard) numberOfCards++;
        return numberOfCards;
    }

    getDetective() : any
    {
        return _.find(this.playingPlayers, this.detective);
    }

    //Step 1 Validation
    isStep1Valid = () : Boolean => this.isPlayerCountValid() && this.arePlayerNamesValid();

    isPlayerCountValid = () : Boolean => (this.playingPlayers.length >= 3);
    arePlayerNamesValid = () : Boolean => (_.every(this.playingPlayers, 'name'));

    //Step 2 Validation
    isStep2Valid = () : Boolean => this.isStep1Valid() && this.areExtraCardsIdentified();
    getNumberOfExtraCards = () : number => 18 % this.playingPlayers.length;
    getPlayersWithExtraCard = () : number => _.filter(this.playingPlayers, 'extraCard').length;
    areExtraCardsIdentified = () : Boolean => this.getPlayersWithExtraCard() == this.getNumberOfExtraCards();
    shouldShowExtraCardValidation = () : Boolean => (this.setupStep == "2" || this.setupStep == "4") && this.getNumberOfExtraCards() !=0;
    getPlayerOrderDisplay = () : string => this.playingPlayers.map((item) => item.name).join(", ");

    goToStep2() : void
    {
        if (!this.getDetective().isPlaying)
            this.detective = _.find(this.playingPlayers, 'isPlaying');
        else
            this.detective = this.getDetective();
    }

    //Step 3 Validation
    isStep3Valid = () : Boolean => this.isStep2Valid() && this.allDetectivesCardsSelected();
    allDetectivesCardsSelected = () : Boolean => this.getDetective() && this.getSelectedCards().length == this.getNumberOfCardsForPlayer(this.getDetective());
    getSelectedCards() : any[]
    {
        if (!this.allCardsByCategory) return [];

        return _.filter(this.allCardsByCategory[0].cards, 'selected')
                        .concat(_.filter(this.allCardsByCategory[1].cards, 'selected'))
                        .concat(_.filter(this.allCardsByCategory[2].cards, 'selected'));
    }

    onPlayerIconPress(suspect : Suspect) : void {
        if (suspect != Suspect.WHITE)
            return;

        this.useOrchid = !this.useOrchid;
        this.gameTracker.configureGame(this.useOrchid);
    }

    startGame() : void
    {
        let players : Player[] = [];
        let detectivesCards = this.getSelectedCards();

        _.forEach(this.playingPlayers, (p) => {
            let player = new Player(p.name, p.suspect.cardIndex, this.getNumberOfCardsForPlayer(p), p == this.detective);
            players.push(player);
        });

        this.navCtrl.setRoot(GameTabsPage, {
            players: players,
            detectivesCards: detectivesCards,
            useOrchid: this.useOrchid
        });
    }
}