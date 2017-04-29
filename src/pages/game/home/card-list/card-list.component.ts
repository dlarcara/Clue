import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { CardCategory, Card } from '../../../../app/game/index';
import { GameCardService } from '../../../../app/shared/index';

import * as _ from 'lodash';

@Component({
    selector: 'card-list-component',
    templateUrl: 'card-list.component.html'
})

export class CardListComponent {
    cards: Card[]
    selectedCard: Card
    callback: any

    constructor(private navCtrl : NavController, private navParams : NavParams, private gameCardService : GameCardService) 
    {
        this.callback = this.navParams.get("callback");
        this.cards = this.navParams.get("cards");
        this.selectedCard = this.navParams.get('selectedCard');
    }

    getCardsGroupedByCategory() : any[]
    {
        return this.gameCardService.groupCardsByCategory(this.cards);
    }

    selectCard(selectedCard) : void
    {
        this.callback(selectedCard).then(()=>{
            this.navCtrl.pop();
        });
    }
}