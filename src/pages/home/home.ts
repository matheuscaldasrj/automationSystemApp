import { FCM } from '@ionic-native/fcm';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
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

  light1Toggle;
  light2Toggle;
  light3Toggle;

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
    private zone: NgZone) {

      this.fcm.getToken().then(token=>{
        this.automationProvider.setToken(token).subscribe  ( ()=> {
          console.log("Token foi registrado");
        })
        this.fcmToken = token;
        console.log(token);
      })

      this.fcm.onTokenRefresh().subscribe(token=>{
        this.automationProvider.setToken(token).subscribe  ( ()=> {
          console.log("Token foi registrado");
        })
        this.fcmToken = token;
      })
      
      console.log("Inicio da aplicação");
  
      if (this.platform.is('cordova')) {
        console.log("TA RODANDO NATIVO");
        this.configNotifications();
      } else {
        console.log("NAAO TA RODANDO NATIVO");
      }
      this.getCurrentTemp();
      this.getCurrentHumidity();
  }

  configNotifications() {
    this.push.hasPermission()
      .then((res: any) => {

        if (res.isEnabled) {
          alert('We have permission to send push notifications');
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
            alert(notification);
    
            this.zone.run(() => {
              this.alerts.push(notification.message);;
            });
            
           
        
        });

          pushObject.on('registration').subscribe((registration: any) => {
            
            console.log(registration);
            alert('Device registered')
        
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

  changeDoorState(doorNumber) {
    this.automationProvider.changeDoorState(doorNumber).subscribe((res: Response) => {
      console.log("Porta " + doorNumber + " teve seu estado alterado ");
    }, (error) => {
      console.log("Error to change door state: " + doorNumber);
      console.log(error);
    });
  }



}
