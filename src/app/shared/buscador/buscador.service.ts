import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class BuscadorService {
  private searchSubject = new Subject<string | void>();

  constructor(private router: Router, private usuariosService: UsuariosService) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((query) => query? this.usuariosService.buscarUsuarios(query) : this.usuariosService.getRandomUsuarios())
      )
      .subscribe((usuarios) => {
        if (usuarios.length == 0){
          this.resultados = [{id: 0, username: 'No se encontraron resultados', nombre: '', foto_perfil: ''}];
        }
        else{
          this.resultados = usuarios;
        }
      });
  }

  resultados: Usuario[] = [];
  buscador: string = '';

  buscarUsuarios(): void {
    this.searchSubject.next(this.buscador);
  }

  getRandomUsuarios(): void {
    this.searchSubject.next();
  }

  seleccionarUsuario(username: string): void {
    this.router.navigate([username]);
    this.limpiarResultados();
    this.limpiarBuscador();
  }

  seleccionarPrimero(): void {
    if (this.resultados.length > 0) {
      this.seleccionarUsuario(this.resultados[0].username);
    }
  }

  limpiarResultados(): void {
    this.resultados.splice(0, this.resultados.length);
  }

  limpiarBuscador(): void {
    this.buscador = '';
  }
}