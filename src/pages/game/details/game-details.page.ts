import { Component, OnInit } from '@angular/core';

import { FilterOptions } from './filter-options.model';
import { GameTracker, Turn, Player } from '../../../app/game/index';

import * as _ from "lodash";

@Component({
    selector: 'game-details-page',
    templateUrl: 'game-details.page.html'
})

export class GameDetailsPage implements OnInit
{
    showFilters: Boolean
    filterOptions: FilterOptions

    useGuessTracking: Boolean
    useLessonsLearned: Boolean

    turnsToDisplay: Turn[]

    constructor(private gameTracker : GameTracker) {}

    ngOnInit() : void 
    {
        this.filterOptions = new FilterOptions();
        this.useGuessTracking = true;
        this.useLessonsLearned = true;

        this.setTurnsToDisplay();
    }

    filterOptionsChanged() : void
    {
        this.setTurnsToDisplay();
    }

    private setTurnsToDisplay() : void
    {
        let filteredTurns = _.filter(this.gameTracker.turns, (t : Turn) => {
            if (!this.filterOptions.showPasses && !t.guess)
                return false;
                
            if (this.filterOptions.filterPlayer && !_.isEqual(t.player, this.filterOptions.filterPlayer))
                return false;

            if (this.filterOptions.onlyShowOpenGuesses)
            {
                if (!t.guess || t.player.isDetective || t.guess.playerThatShowed.isDetective || t.guess.resolvedTurn)
                    return false
            }

            return true;
        });

        this.turnsToDisplay = _.orderBy(filteredTurns, 'number', 'desc');
    }
}