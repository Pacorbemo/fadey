import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario.interface';
import { HttpService } from './http.service';

interface UsuarioRegister {
  username: string;
  nombre: string;
  email: string;
  password: string;
  barbero: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private http: HttpClient, private httpService: HttpService) {}

  registrar(usuario: UsuarioRegister): Observable<any> {
    return this.http.post(`/auth/registro`, usuario);
  }

  login(credenciales: { username: string; password: string }): Observable<any> {
    return this.http.post(`/auth/login`, credenciales);
  }

  validarUsername(username: string): Observable<{ valido: boolean, error?: string }> {
    return this.http.get<{ valido: boolean, error?: string }>(`/usuarios/validar/${username}`);
  }

  datosUsername(username: string): Observable<{ exists:boolean, user: Usuario }> {
    return this.http.get<{ exists:boolean, user: Usuario }>(`/usuarios/username/${username}`);
  }

  verificarEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`/usuarios/email/${email}`);
  }

  esBarbero(id: number): Observable<boolean> {
    return this.http.get<{ barbero: boolean }>(`/barberos/es-barbero/${id}`).pipe(
      map(response => response.barbero)
    );
  }

  buscarUsuarios(query: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`/barberos/buscar/${query}`);
  }

  getRandomUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`/barberos/random`);
  }

  enviarVerificacionEmail(): Observable<any> {
    return this.httpService.postToken('/usuarios/enviar-verificacion-email', {});
  }

  cambiarPassword(data: { actual: string; nueva: string }) {
    return this.httpService.putToken('/usuarios/password', data);
  }

  enviarConfirmacionEliminacion(): Observable<any> {
    return this.httpService.postToken('/usuarios/enviar-confirmacion-eliminacion', {});
  }

  getHorarioBarbero(): Observable<any> {
    return this.httpService.getToken('/barberos/horario');
  }

  setHorarioBarbero(horario: any): Observable<any> {
    return this.httpService.putToken('/barberos/horario', { horario });
  }
}

