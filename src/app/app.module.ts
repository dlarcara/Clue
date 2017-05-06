import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage, SetupPage } from '../pages/index';
import { GameTabsPage, GameHomePage, GameSheetPage, GuessEntryComponent, CardEntryComponent, CardListComponent, PlayerEntryComponent, 
         PlayerListComponent, GameDetailsPage, GameSettingsPage, TurnComponent, EditTurnPage } from '../pages/game/index';

import { GameLoaderService, GameCardService, PlayerIconComponent, CardIconComponent } from './shared/index';
import { GameAlgorithm, GameTracker } from './game/index';

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
    EditTurnPage,
    CardIconComponent,
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
    PlayerListComponent,
    EditTurnPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GameCardService,
    GameLoaderService,
    GameTracker
  ]
})

export class AppModule {}