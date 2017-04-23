import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameTracker, Player } from '../../../app/game/index';

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    activePlayer : Player
    gameTracker : GameTracker

    constructor(private navParams : NavParams) 
    {
        this.gameTracker = this.navParams.get('gameTracker');
        this.activePlayer = this.gameTracker.players[0];
    }

    guessEntered(guess) : void
    {
        this.gameTracker.enterTurn(this.activePlayer, guess);
        this.activePlayer = this.gameTracker.getNextPlayer(this.activePlayer);
    }
}