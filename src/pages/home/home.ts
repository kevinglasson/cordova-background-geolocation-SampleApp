import {Component, ElementRef, NgZone, ViewChild} from '@angular/core';

import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  Platform
} from 'ionic-angular';

import {SettingsPage} from '../settings/settings';
import {BGService} from '../../lib/BGService';
import {SettingsService} from '../../lib/SettingsService';
import {AboutPage} from '../about/about';
import {ToggleWarnPage} from "../toggle-warn/toggle-warn";

declare const google;

// Colors
const COLORS = {
  gold: '#fedd1e',
  white: "#fff",
  blue: "#2677FF",
  light_blue: "#3366cc",
  polyline_color: "#00B3FD",
  green: "#16BE42",
  dark_purple: "#2A0A73",
  grey: "#404040",
  red: "#FE381E",
  dark_red: "#A71300",
  black: "#000"
};
// Icons
const ICON_MAP = {
  activity_unknown: "help-circle",
  activity_still: "body",
  activity_shaking: "walk",
  activity_on_foot: "walk",
  activity_walking: "walk",
  activity_running: "walk",
  activity_on_bicycle: "bicycle",
  activity_in_vehicle: "car",
  pace_true: "pause",
  pace_false: "play",
  provider_network: "wifi",
  provider_gps: "locate",
  provider_disabled: "warning"
};

// Messages
const MESSAGE = {
  reset_odometer_success: 'Reset odometer success',
  reset_odometer_failure: 'Failed to reset odometer: {result}',
  sync_success: 'Sync success ({result} records)',
  sync_failure: 'Sync error: {result}',
  destroy_locations_success: 'Destroy locations success ({result} records)',
  destroy_locations_failure: 'Destroy locations error: {result}',
  removing_markers: 'Removing markers...',
  rendering_markers: 'Rendering markers...'
};

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  @ViewChild('map') mapElement: ElementRef;

  /**
   * @property {google.Map} Reference to Google Map instance
   */
  map: any;
  /**
   * @property {Object} state
   */
  state: any;
  /**
   * @property {BackgroundGeolocation} Reference to actual BackgroundGeolocation plugin
   */
  bgGeo: any;
  /**
   * @property {Object} lastLocation
   */
  lastLocation: any;
  /**
   * @property {Object} map of icons
   */
  iconMap: any;

  currentLocationMarker: any;
  locationAccuracyCircle:  any;
  geofenceHitMarkers: any;
  polyline: any;
  stationaryRadiusCircle: any;
  locationMarkers: any;
  geofenceMarkers: any;
  lastDirectionChangeLocation: any;

  // Geofence Hits
  geofenceHits: any;

  // FAB Menu
  isMainMenuOpen: boolean;
  isSyncing: boolean;
  isResettingOdometer: boolean;
  isMapMenuOpen: boolean;

  constructor(private navCtrl: NavController,
              private platform: Platform,
              private bgService:BGService,
              private settingsService:SettingsService,
              private zone:NgZone,
              private loadingCtrl: LoadingController,
              private modalController: ModalController,
              private alertCtrl: AlertController) {

    this.bgService.on('change', this.onBackgroundGeolocationSettingsChanged.bind(this));
    this.bgService.on('start', this.onBackgroundGeolocationStarted.bind(this));
    this.settingsService.on('change', this.onSettingsChanged.bind(this));

    this.isMainMenuOpen = false;
    this.isMapMenuOpen = false;
    this.isSyncing = false;
    this.isResettingOdometer = false;
    this.iconMap = ICON_MAP;
    this.geofenceHits = [];

    // Initial state
    this.state = {
      enabled: false,
      isMoving: false,
      geofenceProximityRadius: 1000,
      trackingMode: 'location',
      paceIcon: this.iconMap['pace_false'],
      isChangingPace: false,
      activityIcon: this.iconMap['activity_unknown'],
      odometer: 0,
      provider: {
        gps: true,
        network: true,
        enabled: true,
        status: -1
      }
    }
  }

  ionViewDidLoad(){
    this.platform.ready().then(() => {
      this.initialLoad();
    });
  }

  initialLoad() {
    this.configureMap();
    this.configureBackgroundGeolocation();
    this.loadToggleWarn();

    // Do we need to show the settings screen?
    let storage = (<any>window).localStorage;
    let choice = storage.getItem('settings:initialLoad');
    if (choice !== '1') {
      this.onClickSettings();
    }
  }

  /**
   * Configure Google Maps
   */
  configureMap() {
    this.locationMarkers = [];
    this.geofenceMarkers = [];
    this.geofenceHitMarkers = [];

    let latLng = new google.maps.LatLng(-31.950035, 115.860389);

    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Blue current location marker
    this.currentLocationMarker = new google.maps.Marker({
      zIndex: 10,
      map: this.map,
      title: 'Current Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.blue,
        fillOpacity: 1,
        strokeColor: COLORS.white,
        strokeOpacity: 1,
        strokeWeight: 6
      }
    });
    // Light blue location accuracy circle
    this.locationAccuracyCircle = new google.maps.Circle({
      map: this.map,
      zIndex: 9,
      fillColor: COLORS.light_blue,
      fillOpacity: 0.4,
      strokeOpacity: 0
    });
    // Stationary Geofence
    this.stationaryRadiusCircle = new google.maps.Circle({
      zIndex: 0,
      fillColor: COLORS.red,
      strokeColor: COLORS.red,
      strokeWeight: 1,
      fillOpacity: 0.3,
      strokeOpacity: 0.7,
      map: this.map
    });
    // Route polyline
    let seq = {
      repeat: '30px',
      icon: {
        path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
        scale: 1,
        fillOpacity: 0,
        strokeColor: COLORS.white,
        strokeWeight: 1,
        strokeOpacity: 1
      }
    };
    this.polyline = new google.maps.Polyline({
      map: (this.settingsService.state.mapHidePolyline) ? null : this.map,
      zIndex: 1,
      geodesic: true,
      strokeColor: COLORS.polyline_color,
      strokeOpacity: 0.7,
      strokeWeight: 7,
      icons: [seq]
    });
  }

  /**
   * Configure BackgroundGeolocation plugin
   */
  configureBackgroundGeolocation() {
    let bgGeo = this.bgService.getPlugin();

    // Listen to events
    this.onLocation = this.onLocation.bind(this);
    this.onLocationError = this.onLocationError.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onHeartbeat = this.onHeartbeat.bind(this);
    this.onActivityChange = this.onActivityChange.bind(this);
    this.onProviderChange = this.onProviderChange.bind(this);
    this.onSchedule = this.onSchedule.bind(this);
    this.onHttpSuccess = this.onHttpSuccess.bind(this);
    this.onHttpFailure = this.onHttpFailure.bind(this);

    bgGeo.on('location', this.onLocation, this.onLocationError);
    bgGeo.on('motionchange', this.onMotionChange);
    bgGeo.on('heartbeat', this.onHeartbeat);
    bgGeo.on('activitychange', this.onActivityChange);
    bgGeo.on('providerchange', this.onProviderChange);
    bgGeo.on('schedule', this.onSchedule);
    bgGeo.on('http', this.onHttpSuccess, this.onHttpFailure);

    // Fetch current settings from BGService
    this.bgService.getState((config) => {
      config.schedule = [];

      config.notificationLargeIcon = 'drawable/notification_large_icon';

      bgGeo.configure(config, (state) => {
        this.zone.run(() => {
          this.state.enabled = config.enabled;
          this.state.isMoving = config.isMoving;
          this.state.geofenceProximityRadius = config.geofenceProximityRadius;
          this.state.trackingMode = (state.trackingMode === 1 || state.trackingMode === 'location') ? 'location' : 'geofence';
          this.state.paceIcon = this.iconMap['pace_' + config.isMoving];
        });
        if (state.schedule.length > 0) {
          bgGeo.startSchedule();
        }
        console.log('[js] Configure success');
      });
    });
  }

  ////
  // UI event handlers
  //
  onClickMainMenu() {
    this.isMainMenuOpen = !this.isMainMenuOpen;
    if (this.isMainMenuOpen) {
      this.bgService.playSound('OPEN');
    } else {
      this.bgService.playSound('CLOSE');
    }
  }

  onClickSettings() {
    this.bgService.playSound('OPEN');
    let modal = this.modalController.create(SettingsPage, {});
    modal.present();
  }

  onClickAbout() {
    this.bgService.playSound('OPEN');
    let modal = this.modalController.create(AboutPage, {});
    modal.present();
  }

  loadToggleWarn() {
    let modal = this.modalController.create(ToggleWarnPage, {});
    modal.present();
  }

  onClickResetOdometer() {
    this.state.odometer = '0.0';
    let bgGeo = this.bgService.getPlugin();
    this.isResettingOdometer = true;
    this.resetMarkers();

    let zone = this.zone;
    let settingsService = this.settingsService;

    function onComplete(message, result?) {
      settingsService.toast(message, result);
      zone.run(() => { this.isResettingOdometer = false; })
    }

    bgGeo.resetOdometer((location) => {
      onComplete.call(this, MESSAGE.reset_odometer_success);
    }, (error) => {
      onComplete.call(this, MESSAGE.reset_odometer_failure, error);
    });
  }

  onClickDeletePositions() {
    this.alertCtrl.create({
      title: 'Delete all positions?',
      subTitle: 'Are you sure you wish to <strong>DELETE</strong> all of your positions from the server?' +
      '<br><br>' +
      'This is irreversible, and they will no longer be visible on www.cheermeon.com.au',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: () => {
            this.postDeletePositions();
          }
        }]
    }).present();
  }

  onToggleEnabled() {
    this.bgService.playSound('BUTTON_CLICK');

    let bgGeo = this.bgService.getPlugin();

    let storage = (<any>window).localStorage;
    let initialLoad = storage.getItem('settings:initialLoad');

    // Check that a valid participant ID has been sent at some point according to the app
    if (initialLoad === '1') {
      // POST the settings to the server every time we toggle in case we dropped them for some reason i.e. mistakenly deleted
      this.postSettings();
      // Start location tracking
      if (this.state.enabled) {
        bgGeo.start(() => {
          console.warn('[js] START SUCCESS');
          this.doConfirm();
        }, (error) => {
          console.error('[js] START FAILURE: ', error);
        });
        // Stop location tracking
      } else {
        this.state.paceIcon = this.iconMap['pace_false'];
        this.state.isMoving = false;
        bgGeo.stop();
        this.clearMarkers();
      }
      // Display warning if the settings have never been saved
    } else {
      if (this.state.enabled) {
        this.alertCtrl.create({
          title: 'Error',
          subTitle: 'A <strong>Participant ID</strong> is required to use this app, please go to the settings page and enter a valid participant ID.',
          buttons: [{
              text: 'Okay',
              handler: () => {
                this.state.enabled = false;
              }
            }]
        }).present();
      }
    }
  }

  onClickGetCurrentPosition() {
    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();

    bgGeo.getCurrentPosition((location, taskId) => {
      console.log('- getCurrentPosition sample: ', location.sample, location.uuid);
      console.log('[js] getCurrentPosition: ', location);
      bgGeo.finish(taskId);
    }, function(error) {
      console.warn('[js] getCurrentPosition FAILURE: ', error);
    }, {
      maximumAge: 1000,
      desiredAccuracy: 10
    });
  }

  onClickChangePace() {
    if (!this.state.enabled) {
      return;
    }

    function onComplete() {
      this.zone.run(() => { this.isChangingPace = false; })
    }

    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();

    this.state.isChangingPace = true;
    this.state.isMoving = !this.state.isMoving;
    this.state.paceIcon = this.iconMap['pace_' + this.state.isMoving];
    bgGeo.changePace(this.state.isMoving, () => {
      onComplete.call(this);
    }, (error) => {
      onComplete.call(this);
      alert('Failed to changePace');
    });
  }

  ////
  // SettingsService listeners
  //
  onSettingsChanged(name:string, value:any) {
    let map = null;

    switch(name) {
      case 'mapHideMarkers':
        let loader = this.loadingCtrl.create({
          content: (value) ? MESSAGE.removing_markers : MESSAGE.rendering_markers
        });
        loader.present();
        map = (value === true) ? null : this.map;
        this.locationMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        loader.dismiss();
        this.settingsService.toast((value) ? 'Hide location markers' : 'Show location markers', null, 1000);
        break;
      case 'mapHidePolyline':
        map = (value === true) ? null : this.map;
        this.polyline.setMap(map);
        this.settingsService.toast((value) ? 'Hide  polyline' : 'Show polyline', null, 1000);
        break;
      case 'mapShowGeofenceHits':
        map = (value === true) ? this.map : null;
        this.geofenceHitMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        this.settingsService.toast((value) ? 'Show geofence hits' : 'Hide geofence hits', null, 1000);
        break;
    }
  }

  ////
  // BgService listeners
  //
  onBackgroundGeolocationSettingsChanged(name:string, value:any) {
    console.log('Home settingschanged: ', name, value);
    switch(name) {
      case 'geofenceProximityRadius':
        this.state.geofenceProximityRadius = value;
        this.stationaryRadiusCircle.setRadius(value/2);
        break;
    }
  }

  onBackgroundGeolocationStarted(trackingMode:string, state:any) {
    this.zone.run(() => {
      this.state.enabled = state.enabled;
      this.state.isMoving = state.isMoving;
    });
  }

  ////
  // Background Geolocation event-listeners
  //
  onLocation(location:any, taskId:any) {
    console.log('[js] location: ', location);
    let bgGeo = this.bgService.getPlugin();
    this.setCenter(location);
    if (!location.sample) {
      this.zone.run(() => {
        // Convert meters -> km -> round nearest hundredth -> fix float xxx.x
        this.state.odometer = parseFloat((Math.round((location.odometer/1000)*10)/10).toString()).toFixed(1);
      });
    }
    bgGeo.finish(taskId);
  }

  onLocationError(error:any) {
    console.warn('[js] location error: ', error);
  }

  onMotionChange(isMoving:boolean, location:any, taskId:any) {
    console.log('[js] motionchange: ', isMoving, location);
    let bgGeo = this.bgService.getPlugin();
    if (isMoving) {
      this.hideStationaryCircle();
    } else {
      this.showStationaryCircle(location);
    }
    this.zone.run(() => {
      this.state.paceIcon = this.iconMap['pace_' + isMoving];
      this.state.isChangingPace = false;
      this.state.isMoving = isMoving;
    });
    bgGeo.finish(taskId);
  }

  onHeartbeat(event:any) {
    console.log('[js] heartbeat', event);
  }

  onActivityChange(event:any) {
    this.zone.run(() => {
      this.state.activityName = event.activity;
      this.state.activityIcon = this.iconMap['activity_' + event.activity];
    });
    console.log('[js] activitychange: ', event.activity, event.confidence);
  }

  onProviderChange(provider:any) {
    this.zone.run(() => { this.state.provider = provider; });
    console.log('[js] providerchange: ', provider);

  }

  onHttpSuccess(response) {
    console.log('[js] http success: ', response);
  }

  onSchedule(event) {
    console.log('[js] schedule: ', event);
  }

  onHttpFailure(response) {
    console.log('[js] http FAILURE: ', response);
  }

  setCenter(location) {
    this.updateCurrentLocationMarker(location);
    setTimeout(function() {
      this.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
    }.bind(this));
  }

  updateCurrentLocationMarker(location) {
    let latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    this.currentLocationMarker.setPosition(latlng);
    this.locationAccuracyCircle.setCenter(latlng);
    this.locationAccuracyCircle.setRadius(location.coords.accuracy);

    if (location.sample === true) {
      return;
    }
    if (this.lastLocation) {
      this.locationMarkers.push(this.buildLocationMarker(location));
    }
    // Add breadcrumb to current Polyline path.
    this.polyline.getPath().push(latlng);
    if (!this.settingsService.state.mapHidePolyline) {
      this.polyline.setMap(this.map);
    }
    this.lastLocation = location;
  }

  // Build a bread-crumb location marker.
  buildLocationMarker(location, options?) {
    options = options || {};
    let icon = google.maps.SymbolPath.CIRCLE;
    let scale = 3;
    let zIndex = 1;
    let anchor;
    let strokeWeight = 1;

    if (!this.lastDirectionChangeLocation) {
      this.lastDirectionChangeLocation = location;
    }

    // Render an arrow marker if heading changes by 10 degrees or every 5 points.
    let deltaHeading = Math.abs(location.coords.heading - this.lastDirectionChangeLocation.coords.heading);
    if ((deltaHeading >= 15) || !(this.locationMarkers.length % 5) || options.showHeading) {
      icon = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
      scale = 2;
      strokeWeight = 1;
      anchor = new google.maps.Point(0, 2.6);
      this.lastDirectionChangeLocation = location;
    }

    return new google.maps.Marker({
      zIndex: zIndex,
      icon: {
        path: icon,
        rotation: location.coords.heading,
        scale: scale,
        anchor: anchor,
        fillColor: COLORS.polyline_color,
        fillOpacity: 1,
        strokeColor: COLORS.black,
        strokeWeight: strokeWeight,
        strokeOpacity: 1
      },
      map: (!this.settingsService.state.mapHideMarkers) ? this.map : null,
      position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude)
    });
  }

  buildStopZoneMarker(latlng:any) {
    return new google.maps.Marker({
      zIndex: 1,
      map: this.map,
      position: latlng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.red,
        fillOpacity: 0.3,
        strokeColor: COLORS.red,
        strokeWeight: 1,
        strokeOpacity: 0.7
      }
    });
  }

  showStationaryCircle(location:any) {
    let coords = location.coords;
    let radius = this.bgService.isLocationTrackingMode() ? 200 : (this.state.geofenceProximityRadius / 2);
    let center = new google.maps.LatLng(coords.latitude, coords.longitude);

    this.stationaryRadiusCircle.setRadius(radius);
    this.stationaryRadiusCircle.setCenter(center);
    this.stationaryRadiusCircle.setMap(this.map);
    this.map.setCenter(center);
  }

  hideStationaryCircle() {
    // Create a little red breadcrumb circle of our last stop-position
    let latlng = this.stationaryRadiusCircle.getCenter();
    let stopZone = this.buildStopZoneMarker(latlng);
    let lastMarker = this.locationMarkers.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }
    this.locationMarkers.push(stopZone);
    this.stationaryRadiusCircle.setMap(null);
  }

  resetMarkers() {
    // Clear location-markers.
    this.locationMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.locationMarkers = [];

    // Clear geofence hit markers
    this.geofenceHitMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.polyline.setPath([]);
  }

  clearMarkers() {
    this.resetMarkers();

    this.geofenceMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.geofenceMarkers = [];

    // Clear red stationaryRadius marker
    this.stationaryRadiusCircle.setMap(null);

    // Clear blue route PolyLine
    this.polyline.setMap(null);
    this.polyline.setPath([]);
  }

  alert(title, message) {

  }

  doConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Reset odometer?',
        message: 'Would you like to reset the odometer to 0?',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: () => {
            this.onClickResetOdometer();
          }
        }
      ]
    });

    alert.present();
  }

  postSettings() {
    let storage = (<any>window).localStorage;
    let uuid = storage.getItem('device:uuid');
    let firstName = storage.getItem('settings:firstName');
    let lastName = storage.getItem('settings:lastName');
    let participantID = storage.getItem('settings:participantID');

    let data = {
      firstName: firstName,
      lastName: lastName,
      participantID: participantID,
      type: 'name',
      device: {
        uuid: uuid,
        accessToken: 'xA^kf#W.(yzm$3#'
      }
    };

    this.settingsService.post(data, 'http://www.cheermeon.com.au/post')
      .subscribe(
        (response) => {
          console.log("[js] Response " + response);
        },
        (error) => {
          console.log("[js] Error updating name on toggle" + error);
        },
        function () {
          console.log("[js] POST Success")
        });
  }

  postDeletePositions() {
    let storage = (<any>window).localStorage;
    let uuid = storage.getItem('device:uuid');
    let firstName = storage.getItem('settings:firstName');
    let lastName = storage.getItem('settings:lastName');
    let participantID = storage.getItem('settings:participantID');

    let data = {
      firstName: firstName,
      lastName: lastName,
      participantID: participantID,
      type: 'delete',
      device: {
        uuid: uuid,
        accessToken: 'xA^kf#W.(yzm$3#'
      }
    };

    let sendingLoader = this.loadingCtrl.create({
      content: "Deleting..."
    });

    sendingLoader.present();
    this.settingsService.post(data, 'http://www.cheermeon.com.au/post')
      .subscribe((response) => {
          // Dismiss the loader
          sendingLoader.dismiss();
          // Alert the user on success
          console.log("Success " + response);
          this.alertCtrl.create({
            title: 'Success',
            subTitle: 'Deleted',
            buttons: [{
              text: 'Dismiss',
              handler: () => {
                this.state.enabled = false;
              }
            }]
          }).present();
        },
        (error) => {
          // Dismiss the loader
          sendingLoader.dismiss();
          console.log("Error " + error);
          this.alertCtrl.create({
            title: 'Error',
            subTitle: 'For some reason your positions could not be deleted, please check the participantID is still correct in your settings',
            buttons: [{
              text: 'Dismiss',
              handler: () => {
                this.state.enabled = false;
              }
            }]
          }).present();
          },
        function () {

          console.log("[js] POST Success")
        });
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

  shareToFacebook() {
    let url = 'https://www.facebook.com/dialog/feed?app_id=277758716070536&link=http://www.cheermeon.com.au';
    window.open(url, '_blank');
  }
}
