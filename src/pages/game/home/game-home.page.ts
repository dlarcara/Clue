import { Component, ViewChild } from '@angular/core';

import { ToastController  } from 'ionic-angular';

import { GameTracker } from '../../../app/game/index';
import { GameCardService } from '../../../app/shared/index';
import { GuessEntryComponent } from '../index';

import * as _ from "lodash";

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    @ViewChild('guessEntry') guessEntry: GuessEntryComponent

    constructor(public toastCtrl: ToastController, private gameTracker : GameTracker) {}

    guessEntered(guess) : void
    {
        //Make sure guess is entered successfully before moving on to next player
        let entrySuccessful : Boolean = true;       
        try{
            if (!guess)
                this.gameTracker.enterPass(this.gameTracker.getActivePlayer());
            else
                this.gameTracker.enterTurn(guess);
        }
        catch(error)
        {
            this.showGuessError(error);
            entrySuccessful = false;
        }
        
        if (entrySuccessful)
        {
            this.guessEntry.resetEntry();
            this.showGuessEntered(this.gameTracker.getActivePlayer(), guess);
        }
    }

    private showGuessEntered(activePlayer, guess)
    {
        var message = guess ? 
            `Guess entered for ${guess.playerThatGuessed.name}` : 
            `${activePlayer.name} passed`;

        let toast = this.toastCtrl.create({ message: message, duration: 1500 });
        toast.present();
    }

    private showGuessError(message : string)
    {
        let toast = this.toastCtrl.create({ message: message, duration: 5000 });
        toast.present();
    }
}