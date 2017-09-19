import {
  AlertController,
  Events,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {Injectable} from "@angular/core";
// KEVIN
import {Headers, Http, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
// END KEVIN

const SETTINGS = [

  {name: 'geofenceRadius', defaultValue: 200},
  {name: 'geofenceNotifyOnEntry', defaultValue: true},
  {name: 'geofenceNotifyOnExit', defaultValue: false},
  {name: 'geofenceNotifyOnDwell', defaultValue: false},
  {name: 'geofenceLoiteringDelay', defaultValue: 30000},
  {name: 'mapHideMarkers', defaultValue: false},
  {name: 'mapHidePolyline', defaultValue: false},
  {name: 'mapShowGeofenceHits', defaultValue: false},
  {name: 'email', defaultValue: null}
];

const GEOFENCE_RADIUS_OPTIONS = [50, 100, 150, 200, 500, 1000];
const GEOFENCE_LOITERING_DELAY_OPTIONS = [1*1000, 10*1000, 30*1000, 60*1000, 5*60*1000];

@Injectable()

export class SettingsService {

  public state:any;
  public geofenceRadiusOptions: any;
  public geofenceLoiteringDelayOptions: any;
  private myState: any;
  private storage: any;

  constructor(
    private events:Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private http: Http
  ) {
    this.storage = (<any>window).localStorage;

    this.geofenceRadiusOptions = GEOFENCE_RADIUS_OPTIONS;
    this.geofenceLoiteringDelayOptions = GEOFENCE_LOITERING_DELAY_OPTIONS;

    this.state = {};
    if (this.storage.hasOwnProperty('settings')) {
      this.loadState();
    } else {
      SETTINGS.forEach((setting) => {
        this.state[setting.name] = setting.defaultValue;
      });
      this.saveState();
    }
  }

  getSettings() {
    return this.state;
  }

  onChange(name) {
    if (this.myState[name] === this.state[name]) {
      return;
    }
    this.saveState();
    this.events.publish('change', name, this.state[name]);
  }

  set(name, value) {
    if (!this.state.hasOwnProperty(name)) {
      console.warn("SettingsService#set: Unknown property ", name);
      return;
    }
    if (this.myState[name] === value) {
      return;
    }
    this.state[name] = value;
    this.saveState();
    this.events.publish('change', name, value);
  }

  get(name) {
    if (this.state.hasOwnProperty(name)) {
      return this.state[name];
    } else {
      return null;
    }
  }

  toast(message, result?, duration?) {
    if (typeof(result) !== undefined) {
      message = message.replace("\{result\}", result)
    }
    this.toastCtrl.create({
      message: message,
      duration: duration || 3000
    }).present();
  }

  confirm(title, message, callback) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
            alert.dismiss();
        }
      }, {
        text: 'Confirm',
        handler: callback
      }]
    });
    alert.present();
  }

  // KEVIN
  post(data, url) {
    let headers = new Headers;
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    let options = new RequestOptions({headers: headers});

    return this.http.post(url, data, options)
  }

  // END KEVIN

  /**
  * Subscribe to BGService events
  */
  on(event, callback) {
    this.events.subscribe(event, callback);
  }

  private loadState() {
    this.state = JSON.parse(this.storage.getItem('settings'));
    let invalid = false;
    SETTINGS.forEach((setting) => {
      if (!this.state.hasOwnProperty(setting.name)) {
        this.state[setting.name] = setting.defaultValue;
        invalid = true;
      }
    });
    if (!invalid) { this.saveState(); }

    this.myState = Object.assign({}, this.state);
  }
  private saveState() {
    this.storage.setItem('settings', JSON.stringify(this.state, null));
    this.myState = Object.assign({}, this.state);
  }
}
