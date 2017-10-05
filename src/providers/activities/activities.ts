import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Storage} from '@ionic/storage';
import {ActivityModel} from '../models/activity-model';
import {reorderArray} from 'ionic-angular';

@Injectable()
export class Activities {

  activities: any[] = [];
  activityActive = false;
  timerInterval: any;
  secondsElapsed: number = 0;

  constructor(public storage: Storage) {
  }

  load(): void {
    console.log('[js] (load)');

    this.storage.get('activityList').then((activities) => {
      if (activities) {

        for (let activity of activities) {

          let savedActivity = new ActivityModel(activity.name, new Date(activity.lastChecked), activity.totalSeconds, activity.active);
          this.activities.push(savedActivity);

          if (activity.active) {
            this.startTiming(savedActivity, true);
          }
        }
      }
    });

    this.storage.get('activityTime').then((time) => {
      this.secondsElapsed = time;
    });

    this.activities.forEach((act) => {
      console.log('activity name loaded', act.name);
    });

    console.log('DEBUG: Number of activities loaded is: ', this.activities.length);
  }

  save(): void {
    console.log('[js] (save)');

    this.storage.set('activityList', this.activities);
    this.storage.set('activityTime', this.secondsElapsed);
  }

  reorder(indexes): void {

    this.activities = reorderArray(this.activities, indexes);
    this.save();

  }

  startTiming(activity, restarting): void {

    this.activityActive = true;

    if (!restarting) {
      activity.setIsActive(true);
      activity.setLastChecked(new Date());
    }

    this.timerInterval = setInterval(() => {

      let now = new Date();
      let timeDifference = now.getTime() - activity.lastChecked.getTime();
      let seconds = timeDifference / 1000;

      this.secondsElapsed += seconds;
      activity.addToTotalSeconds(seconds);

      activity.setLastChecked(now);
      this.save();

    }, 1000);
  }

  stopTiming(activity): number {

    let totalTimeElapsed = this.secondsElapsed;

    this.activityActive = false;

    activity.setIsActive(false);
    clearInterval(this.timerInterval);
    this.timerInterval = false;
    this.secondsElapsed = 0;
    this.save();

    return totalTimeElapsed;

  }

  increaseSeconds(activity, amount): void {
    activity.addToTotalSeconds(amount);
    this.save();
  }

  decreaseSeconds(activity, amount): void {
    activity.deductFromTotalSeconds(amount);
    this.save();
  }

  addActivity(activity): void {
    console.log('[js] New activity created (addActivity)', activity);
    this.activities.push(activity);
    this.save();

  }

  editActivity(activity, title): void {

    activity.setName(title);
    this.save();

  }

  removeActivity(activity): void {
    console.log('[js] (removeActivity)');
    let index = this.activities.indexOf(activity);

    if (index > -1) {
      this.activities.splice(index, 1);
      this.save();
    }

  }

  clean(): void {
    console.log('[js] clean activity list');
    this.activities = [];
  }

}
