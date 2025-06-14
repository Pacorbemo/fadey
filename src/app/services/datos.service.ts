import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { Usuario, usuarioVacio } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})

export class DatosService {

  private _tokenUsuario: string = '';
  public _user: Usuario = usuarioVacio;
  public noFoto: string = `${environment.serverUrl}/uploads/default-avatar.jpg`;

  limpiarUser(): void {
    this._user = usuarioVacio
    this._tokenUsuario = '';
    localStorage.clear();
  }

  esBarbero(): boolean {
    return this._user.rol === 'barbero';
  }

  esCliente(): boolean {
    return this._user.rol === 'cliente';
  }

  get tokenUsuario(): string {
    return this._tokenUsuario;
  }

  set tokenUsuario(token: string) {
    this._tokenUsuario = token;
    localStorage.setItem('token', token);
  }
  
  set user(user: Usuario) {
    this._user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  get user(): Usuario {
    return this._user;
  }

  constructor() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this._user = JSON.parse(userData);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      this._tokenUsuario = token;
    }
  }
  
  // Creamos un tipo provisional K que representa las claves de Usuario
  actualizar<clave extends keyof Usuario>(campo: clave, valor: Usuario[clave]): void {
    if (this._user && campo in this._user) {
      this._user[campo] = valor;
      localStorage.setItem('user', JSON.stringify(this.user));
    } else {
      console.error(`Campo ${campo} no existe en el usuario.`);
    }
  }
}
