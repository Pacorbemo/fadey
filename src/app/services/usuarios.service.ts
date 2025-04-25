import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';

interface UsuarioRegister {
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

  registrar(usuario: UsuarioRegister): Observable<any> {
    return this.http.post(`/registro`, usuario);
  }

  login(credenciales: { username: string; password: string }): Observable<any> {
    return this.http.post(`/login`, credenciales);
  }

  verificarUsername(username: string): Observable<{ exists: boolean, user?: Usuario }> {
    return this.http.get<{ exists: boolean }>(`/usuario/${username}`);
  }

  datosUsername(username: string): Observable<Usuario> {
    return this.http.get<{ user: Usuario }>(`/usuario/${username}`).pipe(
      map((response) => response.user)
    );
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

  // Buscar por string el nombre o username
  buscarUsuarios(query: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`/buscar-barberos?query=${query}`);
  }
}
