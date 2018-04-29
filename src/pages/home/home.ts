import { FCM } from '@ionic-native/fcm';
import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { AutomationProvider } from '../../providers/automation/automation';

import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Platform } from 'ionic-angular/platform/platform';
import { NgZone } from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  fcmToken;

  currentTemp;
  currentHumidity;

  door1Toggle = false;
  shouldShowPassDialog = true;

  light1Toggle = false;
  light2Toggle = false;
  light3Toggle = false;

  allLights = {
    1: false,
    2: false,
    3: false
  }

  allDoors = {
    1: false,
    2: false,
    3: false
  }

  alerts = new Array<String>();


  constructor(public navCtrl: NavController,
    private automationProvider: AutomationProvider,
    private push: Push,
    private platform: Platform,
    private fcm: FCM,
    private zone: NgZone,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController) {

    console.log("Inicio da aplicação");

    if (this.platform.is('cordova')) {
      this.fcm.getToken().then(token => {
        this.automationProvider.setToken(token).subscribe(() => {
          console.log("Token foi registrado");
        })
        this.fcmToken = token;
        console.log(token);
      })

      this.fcm.onTokenRefresh().subscribe(token => {
        this.automationProvider.setToken(token).subscribe(() => {
          console.log("Token foi registrado");
        })
        this.fcmToken = token;
      })

      console.log("TA RODANDO NATIVO");
      this.configNotifications();
    } else {
      console.log("NAAO TA RODANDO NATIVO");
    }
    this.getCurrentTemp();
    this.getCurrentHumidity();
    this.updateAlerts();
  }

  configNotifications() {
    this.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
          const options: PushOptions = {
            android: {
              senderID: "315240587044"
            },
            ios: {
              alert: 'true',
              badge: true,
              sound: 'false'
            },
            windows: {},
            browser: {
              pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            }
          };
          const pushObject: PushObject = this.push.init(options);

          pushObject.on('notification').subscribe((notification: any) => {

            console.log("notification");
            console.log(notification);

            this.zone.run(() => {
              var index = this.alerts.indexOf(notification.message);
              if (index == -1) {
                //only add if it doest exists
                this.alerts.push(notification.message);
              }

            });



          });

          pushObject.on('registration').subscribe((registration: any) => {

            console.log(registration);
            console.log('Device registered')

          });

          pushObject.on('error').subscribe(error => alert('Error with Push plugin'));

        } else {
          alert('We do not have permission to send push notifications');
        }

      });

  }

  getCurrentTemp() {
    this.automationProvider.getTemperature().subscribe((res: Response) => {
      this.currentTemp = res['value'];
    }, (error) => {
      console.log("Error trying to get current temperature: ");
      console.log(error);
    })
  }

  getCurrentHumidity() {
    this.automationProvider.getHumidity().subscribe((res: Response) => {
      this.currentHumidity = res['value'];
    }, (error) => {
      console.log("Error trying to get current humidity: ");
      console.log(error);
    })
  }

  turnLight(lightNumber) {
    let currentLight = this.allLights[lightNumber];

    if (currentLight) {
      currentLight = 'off';
      this.allLights[lightNumber] = false;
    } else {
      currentLight = 'on';
      this.allLights[lightNumber] = true;
    };

    this.automationProvider.turnLight(lightNumber, currentLight).subscribe((res: Response) => {
      console.log("Luz " + lightNumber + " foi modificada para: " + currentLight);
    }, (error) => {
      console.log("Error to change light: " + lightNumber);
      console.log(error);
    });
  }

  changeDoorState(doorNumber, password) {
    //considering we are using just one door (door1Toggle)
    this.automationProvider.changeDoorState(doorNumber, password).subscribe((res: Response) => {
      console.log("Porta " + doorNumber + " teve seu estado alterado ");
    }, (error) => {
      this.revertDoor1Toggle();
      this.presentToast("Erro ao enviar comando. Verifique a senha");
      console.log("Error to change door state: " + doorNumber);
      console.log(error);
    });
  }

  deleteAlert(alert) {
    this.confirmDeleteAlert(alert);
  }

  revertDoor1Toggle() {
    this.shouldShowPassDialog = false;
    if(this.door1Toggle == false) {
      this.door1Toggle = true;
    } else {
      this.door1Toggle = false;
    }
  }

  confirmDeleteAlert(alert) {
    let alertDialog = this.alertCtrl.create({
      title: 'Excluir alerta',
      message: 'Você tem certeza que deseja excluir este alerta?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Sim',
          handler: () => {
            console.log('Ok clicked');
            this.automationProvider.setAlertAsRead(alert).subscribe((res) => {
              console.log("after alarm has been set as read");
              this.updateAlerts();
            })

          }
        }
      ]
    });
    alertDialog.present();
  }

  confirmDoorPassword(doorNumber) {
    console.log(this.door1Toggle);
    if(this.shouldShowPassDialog == false) {
      //prevent when we have already tried to change
      //password was incorrected
      //and we have change back door state
      //because of ionChange this method will be called
      this.shouldShowPassDialog = true;
      return ;
    }

    //we are trying to open, password required
    this.alertCtrl.create({
      title: 'Senha Mestra',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked');
            this.revertDoor1Toggle();
          }
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            console.log("ok");
            console.log("password: " + data.password);
            if (!data.password) {
              this.presentToast("Senha não é valida");
              this.door1Toggle = false;
            } else {
              this.changeDoorState(doorNumber, data.password);
            }
          }
        }
      ]
    }).present().then(
      (res) => {
        console.log(res);
      }, (error) => {
        console.log(error);
      });
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  updateAlerts() {
    console.log("lets update alerts...");
    this.automationProvider.getAlerts().subscribe((res: Array<any>) => {
      console.log(res);
      this.alerts = [];
      res.forEach(element => {
        this.alerts.push(element);
      });
    });

  }



}
