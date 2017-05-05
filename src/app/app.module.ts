import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage, SetupPage } from '../pages/index';
import { GameTabsPage, GameHomePage, GameSheetPage, GuessEntryComponent, CardEntryComponent, CardListComponent, PlayerEntryComponent, PlayerListComponent, GameDetailsPage, GameSettingsPage, TurnComponent } from '../pages/game/index';

import { GameLoaderService, GameCardService, PlayerIconComponent } from './shared/index';
import { GameAlgorithm } from './game/index';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SetupPage,
    
    GameTabsPage,
    GameHomePage,
    GameSheetPage,
    GameDetailsPage,
    GameSettingsPage,
    GuessEntryComponent,
    CardEntryComponent,
    CardListComponent,
    PlayerEntryComponent,
    PlayerListComponent,
    TurnComponent,
    PlayerIconComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SetupPage,
    GameTabsPage,
    GameHomePage,
    GameSheetPage,
    GameDetailsPage,
    GameSettingsPage,
    GuessEntryComponent,
    CardListComponent,
    PlayerListComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GameCardService,
    GameAlgorithm,
    GameLoaderService
  ]
})

export class AppModule {}