import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Player } from '../../../../app/game/index';

@Component({
    selector: 'player-list-component',
    templateUrl: 'player-list.component.html'
})

export class PlayerListComponent {
    callback: any
    players: Player[]
    selectedPlayer: Player

    constructor(private navCtrl : NavController, private navParams : NavParams) 
    {
        this.callback = this.navParams.get("callback");
        this.players = this.navParams.get("players");
        this.selectedPlayer = this.navParams.get("selectedPlayer");
    }

    selectPlayer(selectedPlayer)
    {
        this.callback(selectedPlayer).then(()=>{
            this.navCtrl.pop();
        });
    }
}