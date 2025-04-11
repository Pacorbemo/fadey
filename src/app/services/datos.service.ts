import { Injectable } from '@angular/core';

interface User {
  id: number;
  username: string;
  nomber: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})

export class DatosService {

  private _tokenUsuario: string = '';
  public user!: User;
  public rol: string = '';

  limpiarUser(): void {
    this.user = { id: 0, username: '', nomber: '', rol: '' };
  }

  esBarbero(): boolean {
    return this.user.rol === 'barbero';
  }

  get tokenUsuario(): string {
    return this._tokenUsuario;
  }

  set tokenUsuario(token: string) {
    this._tokenUsuario = token;
  }

}
