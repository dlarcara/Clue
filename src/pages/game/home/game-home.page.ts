import { Component, ViewChild } from '@angular/core';

import { ToastController  } from 'ionic-angular';

import { GameTracker, Verdict, Card, CardCategory } from '../../../app/game/index';
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
        let previousVerdict = this.gameTracker.getVerdict(); 
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
            if (!_.isEqual(previousVerdict, this.gameTracker.getVerdict()))
                this.showVerdictIdentified(previousVerdict, this.gameTracker.getVerdict());
                
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

    private showVerdictIdentified(previousVerdict : Verdict, currentVerdict : Verdict) : void
    {
        let verdictsLearned : Card[] = [];
        let suspect = new Card(CardCategory.SUSPECT, currentVerdict.suspect);
        if (previousVerdict.suspect == null && currentVerdict.suspect != null)
            verdictsLearned.push(suspect)

        let weapon = new Card(CardCategory.WEAPON, currentVerdict.weapon);
        if (previousVerdict.weapon == null && currentVerdict.weapon != null)
            verdictsLearned.push(weapon)

        let room = new Card(CardCategory.ROOM, currentVerdict.room);
        if (previousVerdict.room == null && currentVerdict.room != null)
            verdictsLearned.push(room)

        let fullSolutionKnown = (currentVerdict.suspect != null && currentVerdict.weapon != null && currentVerdict.room != null );
        let message : string;
        if (fullSolutionKnown)
        {
            message = `Full solution identified! ${suspect.friendlyName} in the ${room.friendlyName} with the ${weapon.friendlyName}!`;
        }
        else
        {
            debugger;
            let newVerdcitsDisplay = verdictsLearned.map((c) => c.friendlyName.toUpperCase()).join(', ');
            message = `Part of the solution identified! ${newVerdcitsDisplay}!`;
        }
            
        let toast = this.toastCtrl.create({ position: 'middle', message: message, duration: 3000, cssClass: 'text-center' });
        toast.present();
    }
}