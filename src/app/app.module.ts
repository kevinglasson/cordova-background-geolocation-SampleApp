import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Device} from '@ionic-native/device';
// KEVIN
import {HttpModule} from '@angular/http';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {SettingsPage} from '../pages/settings/settings';
import {GeofencePage} from '../pages/geofence/geofence';
import {AboutPage} from '../pages/about/about';
import {ActivitiesPage} from '../pages/activities/activities';
import {BGService} from '../lib/BGService';
import {SettingsService} from '../lib/SettingsService';
import {TestService} from '../lib/TestService';
import {Activities} from '../providers/activities/activities';

// END KEVIN

(<any>window).TestService = new TestService();


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    GeofencePage,
    AboutPage,
    ActivitiesPage
  ],
  imports: [
    // KEVIN
    HttpModule,
    // END KEVIN
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    GeofencePage,
    AboutPage,
    ActivitiesPage,
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
