import { Component, Input } from '@angular/core';

import { Player, Suspect } from '../../game/index';

@Component({
    selector: 'player-icon',
    template: `<ion-icon name="contact" [color]="getColor()"></ion-icon>`
})

export class PlayerIconComponent {
    @Input() player: Player

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
}