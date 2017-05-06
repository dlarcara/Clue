import { Component } from '@angular/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';

import { Turn, Player, GameTracker, Guess } from '../../../../app/game/index';
import { GameLoaderService } from '../../../../app/shared/index';


import * as _ from "lodash";

@Component({
    selector: 'edit-turn-page',
    templateUrl: 'edit-turn.page.html'
})

export class EditTurnPage
{
    turn: Turn

    constructor(private navCtrl : NavController, private navParams : NavParams, 
                private gameTracker : GameTracker, private alertCtrl : AlertController) 
    {
        this.turn = navParams.get('turn');
    }

    playerIsDetective(player : Player) : Boolean
    {
        return _.isEqual(player, this.gameTracker.getDetective());
    }

    cancel() : void
    {
        this.navCtrl.pop();
    }

    guessEntered(guess : Guess)
    {
        let replaySuccessful = true;
        try
        {
            //Replace the turn and replay the game
            let clonedTurns = _.cloneDeep(this.gameTracker.turns);
            let newTurns = clonedTurns.map((t) => { 
                if (t.number == this.turn.number)
                    t.guess = guess;

                return t; 
            });
            
            this.gameTracker.replayTurns(newTurns);
        }
        catch(error)
        {
            replaySuccessful = false;

            let alert = this.alertCtrl.create({title: 'Invalid entry', subTitle: error});
            alert.present();    
        }

        if (replaySuccessful)
            this.navCtrl.pop();
    }
}