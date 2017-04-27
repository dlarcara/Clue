import { Component, ViewChild } from '@angular/core';

import { NavParams, ToastController  } from 'ionic-angular';

import { GameTracker, Player } from '../../../app/game/index';
import { GuessEntryComponent } from '../index';

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    activePlayer : Player
    gameTracker : GameTracker

    @ViewChild('guessEntry') guessEntry: GuessEntryComponent

    constructor(private navParams : NavParams, public toastCtrl: ToastController) 
    {
        this.gameTracker = this.navParams.get('gameTracker');
        this.activePlayer = this.gameTracker.players[0];
    }

    guessEntered(guess) : void
    {
        //Make sure guess is entered successfully before moving on to next player
        let entrySuccessful : Boolean = true;       
        try{
            this.gameTracker.enterTurn(this.activePlayer, guess);
        }
        catch(error)
        {
            this.showGuessError(error);
            entrySuccessful = false;
        }
        
        if (entrySuccessful)
        {
            this.guessEntry.resetEntry();
            this.showGuessEntered(guess);
            this.activePlayer = this.gameTracker.getNextPlayer(this.activePlayer);
        }
    }

    private showGuessEntered(guess)
    {
        let toast = this.toastCtrl.create({ message: `Guess entered for ${guess.playerThatGuessed.name}`, duration: 1500, position: 'top'});
        toast.present();
    }

    private showGuessError(message : string)
    {
        let toast = this.toastCtrl.create({ message: message, duration: 5000});
        toast.present();
    }
}