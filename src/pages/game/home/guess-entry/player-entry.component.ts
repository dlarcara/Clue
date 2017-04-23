import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Player } from '../../../../app/game/index';
import { PlayerListComponent } from '../../index';

@Component({
    selector: 'player-entry',
    templateUrl: 'player-entry.component.html'
})

export class PlayerEntryComponent {
    @Input() selectedPlayer : Player
    @Input() players : Player[]

    @Output() playerSelected = new EventEmitter()

    constructor(private navController : NavController) {}

    showPlayerSelect()
    {
        let callback = (player : Player) => 
            { 
                return new Promise((resolve, reject) => {
                    this.playerSelected.emit(player);
                    resolve(); 
                }) 
            };

        this.navController.push(PlayerListComponent, { 
            players: this.players,
            selectedPlayer: this.selectedPlayer,
            callback: callback 
        });
    }
}