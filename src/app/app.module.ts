import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Vibration } from '@ionic-native/vibration';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { AppVersion } from '@ionic-native/app-version';
import { Pro } from '@ionic/pro';

import { MyApp } from './app.component';
import { HomePage, SetupPage } from '../pages/index';
import { GameTabsPage, GameHomePage, GameSheetPage, GuessEntryComponent, CardEntryComponent, CardListComponent, PlayerEntryComponent, 
         PlayerListComponent, GameDetailsPage, GameSettingsPage, TurnComponent, EditTurnPage } from '../pages/game/index';

import { GameLoaderService, GameCardService, PlayerIconComponent, CardIconComponent, GuessParser, SpeechRecognitionService } from './shared/index';
import { GameTracker } from './game/index';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Keep version in sync with Config.XML & src\pages\home\home.ts
const IonicPro = Pro.init('7bda9402', { appVersion: "1.0.3" });

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure 
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    IonicPro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

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
    BrowserModule,
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
    IonicErrorHandler,
    [{ provide: ErrorHandler, useClass: MyErrorHandler }],
    GameCardService,
    GameLoaderService,
    GameTracker,
    GuessParser,
    Vibration,
    SpeechRecognition,
    SpeechRecognitionService,
    AppVersion
  ]
})

export class AppModule {}