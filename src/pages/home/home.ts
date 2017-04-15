import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { SetupPage } from '../index';

@Component({
  templateUrl: 'home.html'
})

export class HomePage {
  constructor(public navCtrl: NavController) {
    
  }

  startGame() : void
  {
    this.navCtrl.setRoot(SetupPage);
  }
}