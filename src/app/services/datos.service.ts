import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

interface User {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  pic: string;
}

@Injectable({
  providedIn: 'root'
})

export class DatosService {

  private _tokenUsuario: string = '';
  public user!: User;
  public rol: string = '';
  public noFoto: string = `${environment.serverUrl}/uploads/default-avatar.jpg`;

  limpiarUser(): void {
    this.user = { id: 0, username: '', nombre: '', rol: '' , pic: '' };
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

}
