import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {ActivityModel} from '../models/activity-model';
import {reorderArray,} from 'ionic-angular';

@Injectable()
export class Activities {

  activities: any[] = [];
  activityActive = false;
  timerInterval: any;
  secondsElapsed: number = 0;
  storage: any;

  constructor() {

  }

  load(): void {
    console.log('[js] (load)');

    let storage = (<any>window).localStorage;
    let activities = storage.getItem('permatimerProjects');

    if (activities) {

      for (let activity of activities) {

        let savedActivity = new ActivityModel(activity.name, new Date(activity.lastChecked), activity.totalSeconds, activity.active);
        this.activities.push(savedActivity);

        if (activity.active) {
          this.startTiming(savedActivity, true);
        }
      }
    }

    let time = storage.getItem('permatimerTime');

    if (time) {
      this.secondsElapsed = time;
    }
  }

  save(): void {
    console.log('[js] (save)');
    let storage = (<any>window).localStorage;
    storage.setItem('permatimerProjects', this.activities);
    storage.setItem('permatimerTime', this.secondsElapsed);
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


}
