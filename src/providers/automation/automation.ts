import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the AutomationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AutomationProvider {

  private baseURL = "http://192.168.0.199:9082/automation";
  
  constructor(private http: HttpClient) {
    console.log('Hello AutomationProvider Provider');
  }

  public getTemperature() {
    return this.http.get(this.baseURL + '/temperature');
  }

  public getHumidity() {
    return this.http.get(this.baseURL + '/humidity');
  }

  public turnLight(lightNumber, lightAction) {
    return this.http.post(this.baseURL + '/light?id=' + lightNumber + "&value=" + lightAction,{});
  }

  public changeDoorState(doorNumber, password){
    return this.http.post(this.baseURL + '/door?id=' + doorNumber + "&password=" + password,{});
  }

  public setToken(userToken) {
    return this.http.post(this.baseURL + '/setToken?token=' + userToken, {});
  }

  public setAlertAsRead(alertMessage) {
    return this.http.post(this.baseURL + '/deleteAlert?alertMessage=' + alertMessage, {});
  }

  public getAlerts() {
    return this.http.get(this.baseURL + '/alerts');
  }

  public setServerAddress(serverAddress){
    this.baseURL = serverAddress;
    console.log("baseUrl has been set to " + this.baseURL);
  }

  public getServerAddress(){
    return this.baseURL;
  }

}
