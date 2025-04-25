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
  private searchSubject = new Subject<string>();

  constructor(private router: Router, private usuariosService: UsuariosService) {
    this.searchSubject
      .pipe(
        debounceTime(300), // Espera 300ms después de que el usuario deja de escribir
        switchMap((query) => this.usuariosService.buscarUsuarios(query)) 
      )
      .subscribe((usuarios) => {
        this.resultados = usuarios; 
      });
  }

  resultados: Usuario[] = [];
  buscador: string = '';

  buscarUsuarios(): void {
    if (this.buscador.length < 3) {
      this.limpiarResultados();
      return;
    }
    this.searchSubject.next(this.buscador); 
  }

  seleccionarUsuario(username: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([username]);
    });
    this.limpiarResultados();
    this.buscador = '';
  }

  seleccionarPrimero(): void {
    if (this.resultados.length > 0) {
      this.seleccionarUsuario(this.resultados[0].username); 
    }
  }

  limpiarResultados(): void {
    this.resultados.splice(0, this.resultados.length);
  }
}