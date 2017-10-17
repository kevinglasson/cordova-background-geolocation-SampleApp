import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Device } from '@ionic-native/device';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { HttpModule } from '@angular/http';
import { IonicStorageModule } from "@ionic/storage";
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { ToggleWarnPage } from '../pages/toggle-warn/toggle-warn';


import { BGService } from '../lib/BGService';
import { SettingsService } from '../lib/SettingsService';
import { TestService } from '../lib/TestService';

// END KEVIN

(<any>window).TestService = new TestService();


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    AboutPage,
    ToggleWarnPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    AboutPage,
    ToggleWarnPage
  ],
  providers: [
    StatusBar,
    InAppBrowser,
    SplashScreen,
    Device,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    }, BGService, SettingsService
  ]
})
export class AppModule {}
