import { Injectable } from '@angular/core';
import { DatosService } from './datos.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, private datosService: DatosService) {}

  private requestWithToken(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    options: any = {},
    saltarCargando: boolean = false
  ): Observable<any> {
    const token = this.datosService.tokenUsuario;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
      .set('SaltarCargando', saltarCargando ? '1' : '0');
    const reqOptions = { ...options, headers};
    switch (method) {
      case 'get':
        return this.http.get(url, reqOptions);
      case 'post':
        return this.http.post(url, options.body, reqOptions);
      case 'put':
        return this.http.put(url, options.body, reqOptions);
      case 'delete':
        return this.http.delete(url, reqOptions);
    }
  }

  getToken(url: string, params?: {}, saltarCargando: boolean = false): Observable<any> {
    return this.requestWithToken('get', url, { params }, saltarCargando);
  }

  postToken(url: string, body: any = {}, saltarCargando: boolean = false): Observable<any> {
    return this.requestWithToken('post', url, { body }, saltarCargando);
  }

  putToken(url: string, body: any = {}, saltarCargando: boolean = false): Observable<any> {
    return this.requestWithToken('put', url, { body }, saltarCargando);
  }

  deleteToken(url: string, saltarCargando: boolean = false): Observable<any> {
    return this.requestWithToken('delete', url, {}, saltarCargando);
  }

  get(url: string, params?: {}, saltarCargando: boolean = false): Observable<any> {
    const headers = new HttpHeaders().set('SaltarCargando', saltarCargando ? '1' : '0');
    return this.http.get(url, { params, headers });
  }
  post(url: string, body: any = {}, saltarCargando: boolean = false): Observable<any> {
    const headers = new HttpHeaders().set('SaltarCargando', saltarCargando ? '1' : '0');
    return this.http.post(url, body, { headers });
  }
  put(url: string, body: any = {}, saltarCargando: boolean = false): Observable<any> {
    const headers = new HttpHeaders().set('SaltarCargando', saltarCargando ? '1' : '0');
    return this.http.put(url, body, { headers });
  }
  delete(url: string, saltarCargando: boolean = false): Observable<any> {
    const headers = new HttpHeaders().set('SaltarCargando', saltarCargando ? '1' : '0');
    return this.http.delete(url, { headers });
  }
  
}
