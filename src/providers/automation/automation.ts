import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the AutomationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AutomationProvider {

  baseURL = "http://192.168.0.199:9082/automation";
  
  constructor(private http: HttpClient) {
    console.log('Hello AutomationProvider Provider');
  }

  public getTemperature() {
    return this.http.get(this.baseURL + '/temperature');
  }

  public turnLight(lightNumber, lightAction) {
    return this.http.post(this.baseURL + '/light?id=' + lightNumber + "&value=" + lightAction,{});
  }

  public changeDoorState(doorNumber){
    return this.http.post(this.baseURL + '/door?id=' + doorNumber,{});
  }
}
