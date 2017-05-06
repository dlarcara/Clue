import { Component, Input } from '@angular/core';

import { AlertController } from 'ionic-angular';

import { Player, Suspect } from '../../game/index';

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
        switch(this.player.suspect)
        {
            case Suspect.GREEN: return "green";
            case Suspect.MUSTARD: return "mustard";
            case Suspect.PEACOCK: return "peacock";
            case Suspect.PLUM: return "plum";
            case Suspect.SCARLET: return "scarlet";
            case Suspect.WHITE: return "white";
        }
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