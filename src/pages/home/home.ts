import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { SetupPage } from '../index';
import { GameTabsPage } from '../game/index';
import { GameDetails, GameLoaderService } from '../../app/shared/index';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})

export class HomePage {
  savedGame : GameDetails

  constructor(public navCtrl: NavController, private gameLoaderService : GameLoaderService) 
  {
    this.savedGame = gameLoaderService.loadGame();  
  }

  startGame() : void
  {
    this.navCtrl.setRoot(SetupPage);
  }

  resumeGame()
  {
    this.navCtrl.setRoot(GameTabsPage, { gameDetails: this.savedGame });  
  }
}