import {Component} from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController,
  ViewController
} from 'ionic-angular';
import {Activities} from '../../providers/activities/activities';
import {ActivityModel} from '../../providers/models/activity-model';
import {StopTimingPage} from '../stop-timing/stop-timing';

@Component({
  selector: 'page-activities',
  templateUrl: 'activity.html'
})
export class ActivitiesPage {

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public activitiesService: Activities,
              public modalCtrl: ModalController,
              private viewCtrl: ViewController) {

  }

  ionViewDidLoad() {
    this.activitiesService.load();
  }

  newActivity(): void {
    console.log('[js] new activity');

    let prompt = this.alertCtrl.create({
      title: 'New Activity',
      message: 'Enter a name for your new activity',
      inputs: [
        {
          name: 'title'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            let activity = new ActivityModel(data.title, new Date(), 0, false);
            this.activitiesService.addActivity(activity);
          }
        }
      ]
    });

    prompt.present();

  }

  editActivity(activity): void {

    let prompt = this.alertCtrl.create({
      title: 'Edit Project',
      message: 'Enter a new name for your new activity',
      inputs: [
        {
          name: 'title'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.activitiesService.editActivity(activity, data.title);
          }
        }
      ]
    });

    prompt.present();
  }

  toggleTimer(activity): void {

    if (!activity.active) {

      if (!this.activitiesService.activityActive) {
        this.activitiesService.startTiming(activity, false);
      } else {

        let alert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'You are already timing a activity. You must stop it before timing a new activity.',
          buttons: ['OK']
        });

        alert.present();

      }

    } else {

      let elapsedTime = this.activitiesService.stopTiming(activity);

      let modal = this.modalCtrl.create(StopTimingPage, {
        elapsedTime: elapsedTime
      });

      modal.onDidDismiss((modifiedSeconds) => {

        if (modifiedSeconds > elapsedTime) {
          let difference = modifiedSeconds - elapsedTime;
          this.activitiesService.increaseSeconds(activity, difference);
        } else {
          let difference = elapsedTime - modifiedSeconds;
          this.activitiesService.decreaseSeconds(activity, difference);
        }

      });

      modal.present();
    }
  }

  onClickClose() {
    this.activitiesService.clean();
    this.viewCtrl.dismiss();
  }
}
