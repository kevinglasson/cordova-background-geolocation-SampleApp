import {Component, NgZone} from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ViewController
} from "ionic-angular";

import {BGService} from '../../lib/BGService';
import {SettingsService} from '../../lib/SettingsService';

import {AboutPage} from '../about/about';

const TRACKING_MODE_OPTIONS = [
  'location',
  'geofence'
];
const LOG_LEVEL_OPTIONS = ['OFF', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'VERBOSE'];
const NOTIFICATION_PRIORITY_OPTIONS = ['DEFAULT', 'HIGH', 'LOW', 'MAX', 'MIN'];

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  isLoaded: boolean;
  loader: any;
  storage: any;
  alert: any;
  state: any;
  basicTab: any;
  listTab: any;
  selectedSegment: string;
  trackingModeOptions: any;
  desiredAccuracyOptions: any;
  distanceFilterOptions: any;
  autoSyncThresholdOptions: any;
  geofenceProximityRadiusOptions: any;
  heartbeatIntervalOptions: any;
  logLevelOptions: any;
  logMaxDaysOptions: any;
  notificationPriorityOptions: any;
  settings: any;
  //geofenceOptions: any;
  //mapOptions: any;
  email: string;


  // KEVIN - me again ^_^
  firstName: string;
  lastName: string;
  riderId: string;
  uuid: string;
  // END KEVIN


  isSyncing: boolean;
  isEmailingLog: boolean;
  isDestroyingLog: boolean;
  isAddingGeofences: boolean;
  isResettingOdometer: boolean;

  constructor(private bgService: BGService,
              private settingsService: SettingsService,
              private alertCtrl: AlertController,
              private viewCtrl: ViewController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private zone: NgZone) {

    this.isLoaded = false;
    this.loader = this.loadingCtrl.create({
      content: "Loading..."
    });

    // We do a BackgroundGeolocation#getState each time Settings screen is shown.
    this.trackingModeOptions = TRACKING_MODE_OPTIONS;
    this.logLevelOptions = LOG_LEVEL_OPTIONS;
    this.notificationPriorityOptions = NOTIFICATION_PRIORITY_OPTIONS;

    this.isSyncing = false;
    this.isAddingGeofences = false;
    this.isResettingOdometer = false;
    this.isDestroyingLog = false;

    let settings = this.bgService.getSettings();
    this.state = {};
    this.bgService.getState((state) => {
      settings.forEach((setting) => {
        this.state[setting.name] = state[setting.name];
      });
      this.state.trackingMode = (state.trackingMode === 1 || state.trackingMode === 'location') ? 'location' : 'geofence';
      this.state.logLevel = this.decodeLogLevel(state.logLevel);
      this.state.notificationPriority = this.decodeNotficationPriority(state.notificationPriority);
      if (this.state.triggerActivities) {
        this.state.triggerActivities = this.decodeTriggerActivities(this.state.triggerActivities);
      }
      // Hide the Loading...
      this.isLoaded = true;
      this.loader.dismiss();
    });
  }

  ionViewDidLoad() {
    // Load email address for email log
    let storage = (<any>window).localStorage;
    var email = storage.getItem('settings:email');

    if (email) {
      this.email = email;
    }

    // KEVIN
    let firstName = storage.getItem('settings:firstName');
    let lastName = storage.getItem('settings:lastName');
    let riderId = storage.getItem('settings:riderId');

    if (firstName) {
      this.firstName = firstName;
    }
    if (lastName) {
      this.lastName = lastName;
    }
    if (riderId) {
      this.riderId = riderId;
    }
    // END KEVIN
  }

  ionViewWillEnter() {
    if (!this.isLoaded) {
      this.loader.present();
    }
  }

  onClickClose() {
    this.bgService.playSound("CLOSE");
    this.viewCtrl.dismiss();
  }

  onClickAbout() {
    this.modalCtrl.create(AboutPage).present();
  }

  onChangeValue(name) {
    var value = this.state[name];
    console.info('onChangeValue: ', name, value);

    if (typeof(value) !== 'undefined') {
      switch (name) {
        case 'logLevel':
          value = this.encodeLogLevel(value);
          break;
        case 'notificationPriority':
          value = this.encodeNotficationPriority(value);
          break;
        case 'trackingMode':
          this.setTrackingMode(value);
          break;
        case 'geofenceProximityRadius':
          this.bgService.playSound('ADD_GEOFENCE');
          break;
        case 'triggerActivities':
          value = this.encodeTriggerActivities(value);
          break;
        case 'hideMarkers':
          break;
        case 'hidePolyline':
          break;
        case 'showGeofenceHits':
          break;
      }
      this.bgService.set(name, value);
    }
  }

  onChangeSetting(name) {
    var value = this.settings[name];
    this.settingsService.set(name, value);
  }

  setTrackingMode(mode) {
    this.bgService.start(mode);
  }

  onClickResetOdometer() {
    this.bgService.playSound('BUTTON_CLICK');
    var bgGeo = this.bgService.getPlugin();
    this.isResettingOdometer = true;

    function onComplete() {
      this.zone.run(() => {
        this.isResettingOdometer = false;
      });
    }

    bgGeo.resetOdometer((location) => {
      onComplete.call(this);
    }, (error) => {
      onComplete.call(this);
      this.notify('Reset odometer error', error);
    });
  }


  onClickSync() {
    this.bgService.playSound('BUTTON_CLICK');
    this.isSyncing = true;

    var bgGeo = this.bgService.getPlugin();

    function onComplete() {
      this.zone.run(() => {
        this.isSyncing = false;
      });
    };

    bgGeo.sync((rs, taskId) => {
      this.bgService.playSound('MESSAGE_SENT');
      onComplete.call(this);
      bgGeo.finish(taskId);
    }, (error) => {
      onComplete.call(this);
      this.bgService.playSound('ERROR');
      this.notify('Sync error', error);
    });
  }

  ////
  // KEVIN - Trying here... BOOM
  //
  onUpdateFirstName() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    storage.setItem('settings:firstName', this.firstName);
    console.log('Stored: ' + this.firstName);
  }

  onUpdateLastName() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    storage.setItem('settings:lastName', this.lastName);
    console.log('Stored: ' + this.lastName);
  }

  onUpdateRiderId() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    storage.setItem('settings:riderId', this.riderId);
    console.log('Stored: ' + this.riderId);
  }

  onClickPostName() {
    // Check if the fields are filled
    if (!this.firstName || !this.lastName || !this.riderId) {
      this.notify('Error', 'Cannot save, check all fields are filled out');
    } else {
      if (!this.uuid) {
        let storage = (<any>window).localStorage;
        this.uuid = storage.getItem('device:uuid');
      }

      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        riderId: this.riderId,
        type: 'name',
        device: {
          uuid: this.uuid,
          accessToken: 'xA^kf#W.(yzm$3#'
        }
      };

      //TODO: rider ID checking needs to happen here
      let message =
        `Name: ${this.firstName} ${this.lastName} <br>Rider ID: ${this.riderId}`;

      this.settingsService.confirm('Updating', message, () => {
        this.settingsService.post(data, this.state.url)
          .subscribe((response) => {
              console.log("Success " + response);
              this.notifyWithCallback(
                'Success',
                'Updated!',
                () => {
                  this.viewCtrl.dismiss();
                });
            },
            (error) => {
              console.log("Error " + error);
              this.notify('Error', 'Update failed, please check that \
                your details are entered correctly.');
            },
            function () {
              console.log("[js] POST Success")
            });
      });
    }
  }
  // END KEVIN

  notify(title, message) {
    this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Dismiss']
    }).present();
  }

  notifyWithCallback(title, message, callback) {
    this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [{
        text: 'Dismiss',
        role: 'cancel',
        handler: callback
      }]
    }).present();
  }

  decodeNotficationPriority(value) {
    switch (value) {
      case 0:
        value = 'DEFAULT';
        break;
      case 1:
        value = 'HIGH';
        break;
      case -1:
        value = 'LOW';
        break;
      case 2:
        value = 'MAX';
        break;
      case -2:
        value = 'MIN';
        break;
      default:
        value = 0;
    }
    return value;
  }

  encodeNotficationPriority(value) {
    switch (value) {
      case 'DEFAULT':
        value = 0;
        break;
      case 'HIGH':
        value = 1;
        break;
      case 'LOW':
        value = -1;
        break;
      case 'MAX':
        value = 2;
        break;
      case 'MIN':
        value = -2;
        break;
    }
    return value;
  }

  decodeLogLevel(value) {
    switch (value) {
      case 0:
        value = 'OFF';
        break;
      case 1:
        value = 'ERROR';
        break;
      case 2:
        value = 'WARNING';
        break;
      case 3:
        value = 'INFO';
        break;
      case 4:
        value = 'DEBUG';
        break;
      case 5:
        value = 'VERBOSE';
        break;
    }
    return value;
  }

  encodeLogLevel(value) {
    switch (value) {
      case 'OFF':
        value = 0;
        break;
      case 'ERROR':
        value = 1;
        break;
      case 'WARNING':
        value = 2;
        break;
      case 'INFO':
        value = 3;
        break;
      case 'DEBUG':
        value = 4;
        break;
      case 'VERBOSE':
        value = 5;
      default:
        value = 5;
    }
    return value;
  }

  decodeTriggerActivities(value) {
    return value.split(',');
  }

  encodeTriggerActivities(value) {
    return value.join(',');
  }

}
