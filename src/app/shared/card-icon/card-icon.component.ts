import { Component, Input } from '@angular/core';

import { AlertController } from 'ionic-angular';

import { Card } from '../../game/index';

@Component({
    selector: 'card-icon',
    template: `<img [src]="card.icon" class="game-card-icon" (tap)="showCardDetails()"/>`
})

export class CardIconComponent {
    @Input() card : Card
    @Input() message : string
    
    constructor(private alertCtrl : AlertController) {}

    showCardDetails(card : Card) : void
    {
        let alert = this.alertCtrl.create({
            title: this.card.friendlyName,
            subTitle: this.message,
            buttons: ['OK']
        });
        
        alert.present();
    }
}