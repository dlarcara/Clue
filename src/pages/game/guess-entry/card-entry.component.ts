import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NavController } from 'ionic-angular';

import { CardCategory } from '../../../app/game/index';
import { GameCardService, GameCard } from '../../../app/shared/index';
import { CardListComponent } from '../../index';

@Component({
    selector: 'card-entry',
    templateUrl: 'card-entry.component.html'
})

export class CardEntryComponent {
    @Input() cardCategory : CardCategory
    @Input() selectedCard: GameCard
    
    @Input() icon : string
    @Input() entryText : string
    
    @Input() enableActivateEntry : Boolean
    @Input() isActive : Boolean

    @Output() cardSelected = new EventEmitter()
    @Output() activeStatusChanged = new EventEmitter()

    constructor(private navController : NavController, private gameCardService : GameCardService) {}

    getCardsForList() : GameCard[]
    {
        if (this.cardCategory == undefined)
            return this.gameCardService.getAllCards();

        return this.gameCardService.getCardsByCategory(this.cardCategory);
    }

    showCardSelect()
    {
        let callback = (card : GameCard) => 
            { 
                return new Promise((resolve, reject) => {
                    this.cardSelected.emit(card);
                    resolve(); 
                }) 
            };

        this.navController.push(CardListComponent, { 
            cards: this.getCardsForList(),
            selectedCard: this.selectedCard,
            callback: callback 
        });
    }

    onActiveStatusChanged() : void
    {
        this.activeStatusChanged.emit(this.isActive);
    }
}