import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { UsuariosService } from './usuarios.service';
import { Usuario } from '../interfaces/usuario.interface';
import { CargandoService } from './cargando.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class BuscadorService {
  private buscarSubject = new Subject<string>();
  private randomSubject = new Subject<void>();

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private cargandoService: CargandoService,
    private toastService: ToastService
  ) {
    this.buscarSubject
      .pipe(
        debounceTime(300),
        switchMap((query) => this.usuariosService.buscarUsuarios(query))
      )
      .subscribe({
        next: (usuarios) => {
          if (this.buscador == '') {
            cargandoService.cargando = false;
            return
          } // Si el buscador cambia en lo que se recibe la respuesta, no se muestran los resultados
          this.resultados = usuarios;
          this.buscadorCopia = this.buscador;
          this.cargandoService.ocultarCargando()
        }, 
        error: (err) => {
          this.cargandoService.ocultarCargando();
          this.toastService.error(err);
        }
      });
    this.randomSubject
      .pipe(switchMap(() => this.usuariosService.getRandomUsuarios()))
      .subscribe({
      next: (usuarios) => {
        this.resultadosAleatorios = usuarios;
        this.resultados = usuarios;
        this.cargandoService.ocultarCargando();
      },
      error: (err) => {
        this.cargandoService.ocultarCargando();
        this.toastService.error(err)
      }
    });
  }

  resultados: Usuario[] = [];
  resultadosAleatorios: Usuario[] = [];
  buscador: string = '';
  buscadorCopia: string = '';

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
