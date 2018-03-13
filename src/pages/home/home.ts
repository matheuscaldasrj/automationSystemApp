import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AutomationProvider } from '../../providers/automation/automation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  currentTemp;

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


  constructor(public navCtrl: NavController, private automationProvider: AutomationProvider) {
    this.getCurrentTemp();
  }


  getCurrentTemp() {
    this.automationProvider.getTemperature().subscribe((res: Response) => {
      this.currentTemp = res['value'];
    }, (error) => {
      console.log("Error trying to get current temperature: ");
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
