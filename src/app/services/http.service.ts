import { Injectable } from '@angular/core';
import { DatosService } from './datos.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient, private datosService: DatosService) {}

  httpGetToken(url: string, params? :{}): Observable<any> {
    const token = this.datosService.tokenUsuario;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const options = { headers, params };
    return this.http.get(url, options);
  }

  httpPostToken(url: string, body: any): Observable<any> {
    const token = this.datosService.tokenUsuario;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(url, body, { headers });
  }
}