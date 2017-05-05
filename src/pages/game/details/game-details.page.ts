import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { GameTracker, Turn, Player } from '../../../app/game/index';

import * as _ from "lodash";

@Component({
    selector: 'game-details-page',
    templateUrl: 'game-details.page.html'
})

export class GameDetailsPage
{
    gameTracker: GameTracker
    
    showFilters: Boolean
    filterPlayer: Player

    showPasses: Boolean
    onlyShowOpenGuesses: Boolean

    useGuessTracking: Boolean
    useLessonsLearned: Boolean

    constructor(private navParams : NavParams)
    {
        this.showFilters = false;
        this.filterPlayer = null;
        
        this.showPasses = false;
        this.onlyShowOpenGuesses = false;

        this.useGuessTracking = true;
        this.useLessonsLearned = true;

        this.gameTracker = navParams.get('gameTracker');
    }

    getTurns() : Turn[]
    {
        let filteredTurns = _.filter(this.gameTracker.turns, (t : Turn) => {
            if (!this.showPasses && !t.guess)
                return false;
                
            if (this.filterPlayer && !_.isEqual(t.player, this.filterPlayer))
                return false;

            if (this.onlyShowOpenGuesses)
            {
                if (!t.guess)
                    return false
                
                if (this.playerIsDetective(t.player) || this.playerIsDetective(t.guess.playerThatShowed))
                    return false;

                if (t.guess.resolvedTurn)
                    return false;
            }

            return true;
        });

        return _.orderBy(filteredTurns, 'number', 'desc');
    }
    
    playerIsDetective(player : Player) : Boolean
    {
        return _.isEqual(player, this.gameTracker.getDetective())
    }
}