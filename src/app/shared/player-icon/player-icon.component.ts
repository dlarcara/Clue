import { Component, Input } from '@angular/core';

import { AlertController } from 'ionic-angular';

import { Player, GameConstants } from '../../game/index';

@Component({
    selector: 'player-icon',
    template: `<ion-icon name="contact" [color]="getColor()" (tap)="showPlayerDetails()" style="text-shadow: 1px 1px 2px #000000;">
    </ion-icon>`
})

export class PlayerIconComponent {
    @Input() player: Player
    @Input() message : string

    constructor(private alertCtrl : AlertController) {}

    getColor() : string
    {
        return GameConstants.getSuspectColor(this.player.suspect);
    }

    showPlayerDetails() : void
    {
        if (!this.message)
            return;

        let alert = this.alertCtrl.create({
            title: this.player.name,
            subTitle: this.message,
            buttons: ['OK']
        });
        
        alert.present();
    }
}