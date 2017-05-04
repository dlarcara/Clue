import { Injectable } from '@angular/core';

import { GameTracker } from '../../game/index';
import { GameDetails } from '../index';

import * as _ from 'lodash';

@Injectable()

export class GameLoaderService
{
    saveGame(gameDetails : GameDetails) : void
    {
        localStorage.setItem('gameDetails', JSON.stringify(gameDetails));
    }

    loadGame() : GameDetails
    {
        if (!localStorage.getItem('gameDetails'))
            return null;

        return JSON.parse(localStorage.getItem('gameDetails'));
    }

    replayGame(gameDetails : GameDetails) : GameTracker
    {
        let gameTracker = new GameTracker(gameDetails.players, gameDetails.detectivesCards);
        _.forEach(gameDetails.turns, (turn) => {
            if (!turn.guess)
                gameTracker.enterPass(turn.player);
            else
            {
                //Wipe resolved Turn off guess, algorithm will recalculate this
                turn.guess.resolvedTurn = null;

                gameTracker.enterTurn(turn.guess);
            }    
        });

        return gameTracker;
    }

    removeGame() : void
    {
        localStorage.removeItem('gameDetails');
    }
}