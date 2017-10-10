import {Events, Platform} from 'ionic-angular';
import {Injectable} from "@angular/core";

import {Device} from '@ionic-native/device';
//Maybe should use this to import our values....
import {accessToken, defaultLocationUrl} from '../consoleConfig';

/**
 * The collection of available BackgroundGeolocation settings
 */
const SETTINGS = {
  common: [
    // Details
    {
      name: 'firstName',
      group: 'details',
      inputType: 'text',
      dataType: 'string',
      defaultValue: ''
    },
    {
      name: 'lastName',
      group: 'details',
      inputType: 'text',
      dataType: 'string',
      defaultValue: ''
    },
    // Geolocation
    {
      // 0 is highest power highest accuracy, 1000 is lowest
      name: 'desiredAccuracy',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [-1, 0, 10, 100, 1000],
      defaultValue: 10
    },
    {
      // Must be 0 for locationUpdateInterval to work
      name: 'distanceFilter',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 10, 50, 100, 1000],
      defaultValue: 0
    },
    {
      name: 'disableElasticity',
      group: 'geolocation',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'geofenceProximityRadius',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [1000, 2500, 5000, 10000, 100000],
      defaultValue: 1000
    },
    {
      name: 'locationTimeout',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 5, 10, 30, 60],
      defaultValue: 60
    },
    // HTTP
    {
      name: 'url',
      group: 'http',
      ignore: true,
      inputType: 'text',
      dataType: 'string',
      defaultValue: defaultLocationUrl
    },
    {
      name: 'method',
      group: 'http',
      inputType: 'select',
      dataType: 'string',
      values: ['POST', 'PUT'],
      defaultValue: 'POST'
    },
    {
      name: 'autoSync',
      group: 'http',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'true'
    },
    {
      name: 'autoSyncThreshold',
      group: 'http',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 5, 10, 25, 50, 100],
      defaultValue: 0
    },
    {
      name: 'batchSync',
      group: 'http',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'maxBatchSize',
      group: 'http',
      dataType: 'integer',
      inputType: 'select',
      values: [-1, 5, 10, 50, 100],
      defaultValue: -1
    },
    {
      name: 'maxRecordsToPersist',
      group: 'http',
      dataType: 'integer',
      inputType: 'select',
      values: [-1, 0, 1, 5, 10],
      defaultValue: -1
    },
    // Application
    {
      name: 'stopOnTerminate',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'true'
    },
    {
      name: 'startOnBoot',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'stopTimeout',
      group: 'activity_recognition',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1, 3, 5, 10, 15],
      defaultValue: 1
    },
    {
      // Setting the default so that it doesn't do recognition
      // Might stuff some other things up though???
      name: 'activityRecognitionInterval',
      group: 'activity_recognition',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1000, 10000, 30000, 60000],
      defaultValue: 999999999
    },
    {
      name: 'heartbeatInterval',
      group: 'application',
      dataType: 'integer',
      inputType: 'select',
      values: [-1, 60, (2 * 60), (5 * 60), (15 * 60)],
      defaultValue: 60
    },
    // Logging & Debug
    {
      name: 'debug',
      group: 'debug',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'logLevel',
      group: 'debug',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1, 2, 3, 4, 5],
      defaultValue: 5
    },
    {
      name: 'logMaxDays',
      group: 'debug',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1, 2, 3, 4, 5, 6, 7],
      defaultValue: 5
    }
  ],
  iOS: [
    // Geolocation
    {
      name: 'stationaryRadius',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [25, 50, 100, 500, 1000],
      defaultValue: 25
    },
    {
      name: 'activityType',
      group: 'geolocation',
      dataType: 'string',
      inputType: 'select',
      values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'],
      defaultValue: 'OtherNavigation'
    },
    {
      name: 'useSignificantChangesOnly',
      group: 'geolocation',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    // Activity Recognition
    {
      name: 'stopDetectionDelay',
      group: 'activity_recognition',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1, 2, 5],
      defaultValue: 0
    },
    {
      name: 'disableStopDetection',
      group: 'activity_recognition',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: false
    },
    {
      name: 'disableMotionActivityUpdates',
      group: 'activity_recognition',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'preventSuspend',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    }
  ],
  Android: [
    // Geolocation
    {
      name: 'locationUpdateInterval',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1000, 5000, 10000, 30000, 60000],
      defaultValue: 30000
    },
    {
      name: 'fastestLocationUpdateInterval',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1000, 5000, 10000, 30000, 60000],
      defaultValue: 10000
    },
    {
      name: 'deferTime',
      group: 'geolocation',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 10 * 1000, 30 * 1000, 60 * 1000, 10 * 60 * 1000],
      defaultValue: 10000
    },
    // Activity Recognition
    {
      name: 'triggerActivities',
      group: 'activity_recognition',
      dataType: 'string',
      inputType: 'select',
      multiple: true,
      values: ['in_vehicle', 'on_bicycle', 'on_foot', 'running', 'walking'],
      defaultValue: ''
    },
    // Application
    {
      name: 'foregroundService',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'notificationPriority',
      ignore: true,
      group: 'application',
      dataType: 'integer',
      inputType: 'select',
      values: [0, 1, -1, 2, -2],
      defaultValue: 0
    },
    {
      name: 'forceReloadOnBoot',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'forceReloadOnMotionChange',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'forceReloadOnLocationChange',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'forceReloadOnGeofence',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    },
    {
      name: 'forceReloadOnHeartbeat',
      group: 'application',
      dataType: 'boolean',
      inputType: 'toggle',
      values: ['true', 'false'],
      defaultValue: 'false'
    }
  ]
};

/**
 * A collection of soundId for use with BackgroundGeolocation#playSound
 */
const SOUND_MAP = {
  "iOS": {
    "LONG_PRESS_ACTIVATE": 1113,
    "LONG_PRESS_CANCEL": 1075,
    "ADD_GEOFENCE": 1114,
    "BUTTON_CLICK": 1104,
    "MESSAGE_SENT": 1303,
    "ERROR": 1006,
    "OPEN": 1502,
    "CLOSE": 1503,
    "FLOURISH": 1509
  },
  "Android": {
    "LONG_PRESS_ACTIVATE": 27,
    "LONG_PRESS_CANCEL": 94,
    "ADD_GEOFENCE": 28,
    "BUTTON_CLICK": 19,
    "MESSAGE_SENT": 90,
    "ERROR": 89,
    "OPEN": 37,
    "CLOSE": 94,
    "FLOURISH": 37
  }
};

@Injectable()

/**
 * @class BGService This is a wrapper for interacting with the BackgroundGeolocation plugin
 * througout the app.
 */
export class BGService {
  private storage: any;
  private state: any;
  private settings: any;
  private plugin: any;
  private deviceInfo: any;
  private uuid: any;

  constructor(private platform: Platform, private events: Events, private device: Device) {
    // We don't need cordova-sqlite-storage.
    this.storage = (<any>window).localStorage;
    // We fetch put Device.uuid into localStorage to determine if this is first-boot of app.
    this.uuid = this.storage.getItem('device:uuid');

    platform.ready().then(this.init.bind(this));
  }

  /**
   * Return Array of all settings by platform
   */
  getSettings() {
    return this.settings.list;
  }

  /**
   * Get current BackgroundGeolocation state.
   * @return {Object}
   */
  getState(callback) {
    this.plugin.getState((state) => {
      this.state = state;
      if (this.uuid) {
        callback(state);
        return;
      }
      // FIRST BOOT OF APP!  Cache the device uuid so we know we've seen this device before.
      this.uuid = this.device.uuid;
      this.storage.setItem('device:uuid', this.uuid);

      // Override a few defaults on first-boot so user can hear debug sounds.
      this.state.foregroundService = false;
      this.state.autoSync = true;
      this.state.heartbeatInterval = 60;
      this.state.stopOnTerminate = false;
      this.state.startOnBoot = false;
      this.state.url = defaultLocationUrl;
      this.state.debug = false;
      this.state.logLevel = this.plugin.LOG_LEVEL_VERBOSE;
      this.state.params = {
        device: this.deviceInfo,
        accessToken: accessToken,
        type: 'position'
      };
      callback(this.state);
    });
  }

  getPlatformSettings(group) {
    let settings = [];
    this.settings.list.forEach((setting) => {
      if ((setting.group === group) && !setting.ignore) {
        settings.push(setting);
      }
    });
    return settings;
  }

  /**
   * @return BackgroundGeolocation
   */
  getPlugin() {
    return this.plugin;
  }

  /**
   * Set a BackgroundGeolocation config option
   * @param {String} name
   * @param {Mixed} value
   */
  set(name: string, value: any, callback?: Function) {
    console.log('BGService#set ', name, value);

    var setting = this.settings.map[name];
    if (!setting) {
      // No change:  Ignore
      console.info('ignored');
      return;
    }
    // Type-casting String from form-field value
    switch (setting.dataType) {
      case 'integer':
        value = parseInt(value, 10);
        break;
      case 'boolean':
        value = (typeof(value) === 'string') ? (value === 'true') : value;
        break;
    }
    if (this.state[name] === value) {
      return;
    }
    this.playSound('BUTTON_CLICK');
    // Update state
    this.state[name] = value;
    // Create config {} for BackgroundGeolocation
    var config = {};
    config[name] = value;

    this.plugin.setConfig(config, (state) => {
      this.events.publish('change', name, value);
      if (typeof(callback) == 'function') {
        callback(state);
      }
    });
  }

  /**
   * Start BackgroundGeolocation in provided mode
   * @param {String} trackingMode
   */
  start(trackingMode: string) {
    let onStarted = (state) => {
      this.events.publish('start', trackingMode, state);
    };
    this.state.trackingMode = trackingMode;
    if (trackingMode === 'location') {
      this.plugin.start(onStarted);
    } else {
      this.plugin.startGeofences(onStarted);
    }
  }

  /**
   * Subscribe to BGService events
   */
  on(event, callback) {
    this.events.subscribe(event, callback);
  }

  private init() {
    this.deviceInfo = {
      model: this.device.model,
      platform: this.device.platform,
      uuid: this.device.uuid,
      version: this.device.version,
      manufacturer: this.device.manufacturer,
      framework: 'Cordova'
    };

    ///
    // Here is the glorious reference to the BackgroundGeolocation plugin
    //
    this.plugin = (<any>window).BackgroundGeolocation;

    // Build a collection of available settings by platform for use on the Settings screen
    var settings = [].concat(SETTINGS.common).concat(SETTINGS[this.device.platform || 'iOS']);
    this.settings = {
      list: settings,
      map: {}
    };

    for (var n = 0, len = settings.length; n < len; n++) {
      var setting = settings[n];
      this.settings.map[setting.name] = setting;
    }
  }

  isLocationTrackingMode() {
    return (this.state.trackingMode === 'location') || (this.state.trackingMode === 1);
  }

  getOptionsForSetting(name) {
    var setting = this.settings.map[name];
    if (!setting) {
      console.warn('Unknown option: ', name);
      return [];
    } else {
      return setting.values;
    }
  }

  playSound(name) {
    var soundId = 0;

    if (typeof(name) === 'string') {
      soundId = SOUND_MAP[this.device.platform][name];
    } else if (typeof(name) === 'number') {
      soundId = name;
    }
    if (!soundId) {
      alert('Invalid sound id provided to BGService#playSound' + name);
      return;
    }
    this.plugin.playSound(soundId);
  }
}
