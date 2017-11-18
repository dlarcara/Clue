import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import { SetupPage } from '../index';
import { GameTabsPage } from '../game/index';
import { GameDetails, GameLoaderService } from '../../app/shared/index';

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})

export class HomePage {
  savedGame : GameDetails
  version: string

  constructor(public navCtrl: NavController, private gameLoaderService : GameLoaderService,
              private appVersion: AppVersion) 
  {
    this.savedGame = gameLoaderService.loadGame();  

    //Keep version in sync with Config.XML & app.module.ts
    appVersion.getVersionNumber().then(value => this.version = "v" + value, value => this.version = "v1.0.1");
  }

  newGame() : void
  {
    this.navCtrl.setRoot(SetupPage);
  }

  resumeGame()
  {
    this.navCtrl.push(GameTabsPage, { gameDetails: this.savedGame });  
  }
}