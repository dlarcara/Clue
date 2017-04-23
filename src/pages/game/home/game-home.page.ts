import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameTracker, Player } from '../../../app/game/index';

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    activePlayer: Player;
    gameTracker: GameTracker

    constructor(private navParams : NavParams) 
    {
        let detective = this.navParams.get('detective');
        let players = this.navParams.get('players');
        let detectivesCards = this.navParams.get('detectivesCards');

        this.activePlayer = players[0];
        this.gameTracker = new GameTracker(detective, players, detectivesCards);
    }

    guessEntered(guess) : void
    {
        this.gameTracker.enterTurn(this.activePlayer, guess);
        this.activePlayer = this.gameTracker.getNextPlayer(this.activePlayer);
    }
}