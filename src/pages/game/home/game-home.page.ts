import { Component, ViewChild } from '@angular/core';

import { ToastController  } from 'ionic-angular';

import { GameTracker, Card, Player } from '../../../app/game/index';
import { GuessEntryComponent } from '../index';

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
        let turnForPlayer : Player = this.gameTracker.getActivePlayer();
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
            this.showNewVerdictInformation();
            this.guessEntry.resetEntry();
            this.showGuessEntered(turnForPlayer, guess);
        }
    }

    private showGuessEntered(turnForPlayer, guess)
    {
        var message = guess ? 
            `Guess entered for ${turnForPlayer.name}` : 
            `${turnForPlayer.name} passed`;

        let toast = this.toastCtrl.create({ message: message, duration: 1500 });
        toast.present();
    }

    private showGuessError(message : string)
    {
        let toast = this.toastCtrl.create({ message: message, duration: 5000 });
        toast.present();
    }

    private showNewVerdictInformation() : void
    {
        let activeTurn = this.gameTracker.turns[this.gameTracker.turns.length-1];
        let currentVerdict = activeTurn.resultingSheet.getVerdict();

        if (currentVerdict.suspect != null && currentVerdict.weapon != null && currentVerdict.room != null )
        {
            let message = `Full solution identified! ${currentVerdict.suspect.friendlyName} in the ${currentVerdict.room.friendlyName} 
                           with the ${currentVerdict.weapon.friendlyName}!`;
        
            let toast = this.toastCtrl.create({ position: 'middle', message: message, duration: 3000, cssClass: 'text-center' });
            toast.present();
        }
        else 
        {
            let verdictsLearned : Card[] = [];
            
            if (activeTurn.lessonsLearned.identifiedSuspect)
                verdictsLearned.push(currentVerdict.suspect);

            if (activeTurn.lessonsLearned.identifiedWeapon)
                verdictsLearned.push(currentVerdict.weapon);

            if (activeTurn.lessonsLearned.identifiedRoom)
                verdictsLearned.push(currentVerdict.room);

            if (verdictsLearned.length)
            {
                let newVerdcitsDisplay = verdictsLearned.map((c) => c.friendlyName.toUpperCase()).join(', ');
                let message = `Part of the solution identified! ${newVerdcitsDisplay}!`;
                let toast = this.toastCtrl.create({ position: 'middle', message: message, duration: 3000, cssClass: 'text-center' });
                toast.present();
            }
        }
    }
}