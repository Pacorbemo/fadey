import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Usuario {
  username: string;
  nombre: string;
  email: string;
  password: string;
  barbero: boolean;
  telefono: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private http: HttpClient) {}

  registrar(usuario: Usuario): Observable<any> {
    const body = usuario;
    return this.http.post(`/registro`, body);
  }

  login(credenciales: { username: string; password: string }): Observable<any> {
    const body = credenciales;
    return this.http.post(`/login`, body);
  }

  // getUserById(id: number): Observable<{username: string; nombre: string}> {
  //   return this.http.get<{username: string; nombre: string}>(`/usuario/${id}`);
  // }

  verificarUsername(username: string): Observable<{ exists: boolean; idBarbero?: number }> {
    return this.http.get<{ exists: boolean }>(`/usuario/${username}`);
  }

  verificarEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`/usuarios/email/${email}`);
  }

  verificarTelefono(telefono: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`/usuarios/telefono/${telefono}`);
  }

  esBarbero(id:number): Promise<boolean>{
    return new Promise((resolve) =>{
      this.http.get<{ barbero: boolean }>(`/es-barbero/${id}`).subscribe((response) => {
        resolve(response.barbero);
      });
    });
  }
}
