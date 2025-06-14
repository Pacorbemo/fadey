import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { Usuario, usuarioVacio } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})

export class DatosService {

  private _tokenUsuario: string = '';
  public user: Usuario = usuarioVacio;
  public rol: string = '';
  public noFoto: string = `${environment.serverUrl}/uploads/default-avatar.jpg`;

  limpiarUser(): void {
    this.user = usuarioVacio
    this._tokenUsuario = '';
  }

  esBarbero(): boolean {
    return this.user.rol === 'barbero';
  }

  esCliente(): boolean {
    return this.user.rol === 'cliente';
  }

  get tokenUsuario(): string {
    return this._tokenUsuario;
  }

  set tokenUsuario(token: string) {
    this._tokenUsuario = token;
  }
  
  // Creamos un tipo provisional K que representa las claves de Usuario
  actualizar<clave extends keyof Usuario>(campo: clave, valor: Usuario[clave]): void {
    if (this.user && campo in this.user) {
      this.user[campo] = valor;
      localStorage.setItem('user', JSON.stringify(this.user));
    } else {
      console.error(`Campo ${campo} no existe en el usuario.`);
    }
  }
}
