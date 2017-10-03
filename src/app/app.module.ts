import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Device } from '@ionic-native/device';
// KEVIN
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from "@ionic/storage";
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { GeofencePage } from '../pages/geofence/geofence';
import { AboutPage } from '../pages/about/about';
import { ActivitiesPage } from '../pages/activity/activity';
import { StopTimingPage } from '../pages/stop-timing/stop-timing';

import { BGService } from '../lib/BGService';
import { SettingsService } from '../lib/SettingsService';
import { TestService } from '../lib/TestService';
import { Activities } from '../providers/activities/activities';

// END KEVIN

(<any>window).TestService = new TestService();


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    GeofencePage,
    AboutPage,
    ActivitiesPage,
    StopTimingPage
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
    GeofencePage,
    AboutPage,
    ActivitiesPage,
    StopTimingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    }, BGService, SettingsService,
    Activities
  ]
})
export class AppModule {}
