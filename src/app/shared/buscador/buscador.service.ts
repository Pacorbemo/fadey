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
  private buscarSubject = new Subject<string>();
  private randomSubject = new Subject<void>();

  constructor(private router: Router, private usuariosService: UsuariosService) {
    this.buscarSubject
      .pipe(
        debounceTime(300),
        switchMap((query) => this.usuariosService.buscarUsuarios(query))
      )
      .subscribe((usuarios) => {
        if(this.buscador == '') return;  
        this.resultados = usuarios;
      });
    this.randomSubject
      .pipe(
        switchMap(() => this.usuariosService.getRandomUsuarios())
      )
      .subscribe((usuarios) => {
        this.resultados = usuarios;
      });
  }

  resultados: Usuario[] = []
  buscador: string = '';

  buscarUsuarios(): void {
    this.buscador = this.buscador.trim();
    if (this.buscador.length === 0) {
      this.limpiarResultados();
      return;
    }
    this.buscarSubject.next(this.buscador);
  }

  getRandomUsuarios(): void {
    this.randomSubject.next();
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