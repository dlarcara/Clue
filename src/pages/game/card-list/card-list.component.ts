import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { CardCategory } from '../../../app/game/index';
import { GameCard } from '../../../app/shared/index';

import * as _ from 'lodash';

@Component({
    selector: 'card-list-component',
    templateUrl: 'card-list.component.html'
})

export class CardListComponent {
    cards: GameCard[]
    selectedCard: GameCard
    callback: any

    constructor(private navCtrl : NavController, private navParams : NavParams) 
    {
        this.callback = this.navParams.get("callback");
        this.cards = this.navParams.get("cards");
        this.selectedCard = this.navParams.get('selectedCard');
    }

    getCardsGroupedByCategory() : any[]
    {
        return _.chain(this.cards)
                .groupBy('cardCategory')
                .toPairs()
                .map(item => _.zipObject(['category', 'cards'], item))
                .map((item : {category, cards}) =>  { return {category: this.getCategoryDisplay(+item.category), cards: item.cards }; })
                .value();
    }

    getCategoryDisplay(cardCategory : CardCategory) : string
    {
        switch(cardCategory)
        {
            case CardCategory.SUSPECT: return "Suspect";
            case CardCategory.WEAPON: return "Weapon";
            case CardCategory.ROOM: return "Room";
        }

        return "";
    }

    selectCard(selectedCard) : void
    {
        this.callback(selectedCard).then(()=>{
            this.navCtrl.pop();
        });
    }
}