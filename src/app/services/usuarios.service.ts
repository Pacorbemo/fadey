import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Usuario {
  username: string;
  nombre: string;
  email: string;
  password: string;
  barbero: boolean,
  telefono: string,
}

@Injectable({
  providedIn: 'root'
})

export class UsuariosService {
  private apiUrl = 'http://localhost:5000/';

  constructor(private http: HttpClient) {}

  registrar(usuario: Usuario): Observable<any> {
    const body = usuario;
    return this.http.post(`${this.apiUrl}registro`, body);
  }

  login(credenciales: { username: string; password: string }): Observable<any> {
    const body = credenciales;
    return this.http.post(`${this.apiUrl}login`, body);
  }
}
