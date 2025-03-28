import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Usuario {
  username: string;
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:5000/registro';

  constructor(private http: HttpClient) {}

  registrar(usuario: Usuario): Observable<any> {
    const body = usuario;
    return this.http.post(this.apiUrl, body);
  }
}
