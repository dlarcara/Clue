import { Injectable } from '@angular/core';

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

    removeGame() : void
    {
        localStorage.removeItem('gameDetails');
    }
}