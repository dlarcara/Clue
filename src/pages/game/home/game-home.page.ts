import { Component, ViewChild } from '@angular/core';

import { NavParams, ToastController  } from 'ionic-angular';

import { GameTracker, Player, Card, CellStatus } from '../../../app/game/index';
import { GameDetails, GameLoaderService, GameCardService } from '../../../app/shared/index';
import { GuessEntryComponent } from '../index';

import * as _ from "lodash";

@Component({
    selector: 'game-home-page',
    templateUrl: 'game-home.page.html'
})

export class GameHomePage {
    activePlayer : Player
    gameTracker : GameTracker

    @ViewChild('guessEntry') guessEntry: GuessEntryComponent

    constructor(private navParams : NavParams, public toastCtrl: ToastController, private gameLoaderService : GameLoaderService,
                private gameCardService : GameCardService) 
    {
        this.gameTracker = this.navParams.get('gameTracker');
        
        let activePlayer = this.navParams.get('activePlayer');
        if (activePlayer)
            this.activePlayer = _.find(this.gameTracker.players, activePlayer);
        else
            this.activePlayer = this.gameTracker.players[0];

        this.saveGame();
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
            this.showGuessEntered(this.activePlayer, guess);
            this.activePlayer = this.gameTracker.getNextPlayer(this.activePlayer);

            this.saveGame();
        }
    }

    getProgress() : number
    {
        return this.gameTracker.getProgress();
    }

    private saveGame() : void
    {
        let gameDetails = new GameDetails(this.gameTracker.players, this.gameTracker.detectiveCards, this.gameTracker.turns, this.activePlayer)

        this.gameLoaderService.saveGame(gameDetails);
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