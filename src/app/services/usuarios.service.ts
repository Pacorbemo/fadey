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
  constructor(private httpService: HttpService) {}

  registrar(usuario: UsuarioRegister): Observable<any> {
    return this.httpService.post(`/auth/registro`, usuario);
  }

  login(credenciales: { username: string; password: string }): Observable<any> {
    return this.httpService.post(`/auth/login`, credenciales);
  }

  validarUsername(username: string): Observable<{ valido: boolean, error?: string }> {
    return this.httpService.get<{ valido: boolean, error?: string }>(`/usuarios/validar/${username}`);
  }

  datosUsername(username: string): Observable<{ exists:boolean, user: Usuario }> {
    return this.httpService.get<{ exists:boolean, user: Usuario }>(`/usuarios/username/${username}`);
  }

  verificarEmail(email: string): Observable<{ exists: boolean }> {
    return this.httpService.get<{ exists: boolean }>(`/usuarios/email/${email}`);
  }

  esBarbero(id: number): Observable<boolean> {
    return this.httpService.get<{ barbero: boolean }>(`/barberos/es-barbero/${id}`).pipe(
      map(response => response.barbero)
    );
  }

  buscarUsuarios(query: string): Observable<Usuario[]> {
    return this.httpService.get<Usuario[]>(`/barberos/buscar/${query}`);
  }

  getRandomUsuarios(): Observable<Usuario[]> {
    return this.httpService.get<Usuario[]>(`/barberos/random`);
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

