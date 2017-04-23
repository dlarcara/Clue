import { Component } from '@angular/core';

import { } from 'ionic-angular';

import { GameTracker, CardCategory, Card, Suspect, Player } from '../../app/game/index';

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    activePlayer: Player;
    gameTracker: GameTracker

    constructor() 
    {
        //Fake Data - to be passed in from setup page
        let players = [ 
            new Player("Mom", Suspect.WHITE, 3), new Player("David", Suspect.MUSTARD, 3), 
            new Player("Dad", Suspect.GREEN, 3), new Player("Mike", Suspect.PLUM, 3),
            new Player("Steph", Suspect.PEACOCK, 3), new Player("Jackie", Suspect.SCARLET, 3)
        ];
        let cards = [ new Card(CardCategory.SUSPECT, Suspect.GREEN), new Card(CardCategory.SUSPECT, Suspect.WHITE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)]
        
        this.activePlayer = players[0];
        this.gameTracker = new GameTracker(players[0], players, cards);
    }

    guessEntered(guess) : void
    {
        this.gameTracker.enterTurn(this.activePlayer, guess);
        this.activePlayer = this.gameTracker.getNextPlayer(this.activePlayer);
    }
}