import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent {
  busqueda: string = '';
  resultados: { id: number; username: string; nombre: string; foto_perfil: string }[] = [];
  private searchSubject = new Subject<string>();

  constructor(private router: Router, private usuariosService: UsuariosService) {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap((query) => this.usuariosService.buscarUsuarios(query))
    ).subscribe((usuarios) => {
      this.resultados = usuarios;
    });
  }

  // navegar(ruta: string): void {
  //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //     this.router.navigate([ruta]);
  //   });
  // }

  buscarUsuarios(query: string): void {
    if (query.length < 3) {
      this.limpiarResultados();
      return;
    }
    this.searchSubject.next(query);
  }

  seleccionarUsuario(usuario: { id: number; username: string; nombre: string; foto_perfil: string }): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([usuario.username + '/citas']);
    });
    this.limpiarResultados();
    this.busqueda = '';
  }

  seleccionarPrimero(): void {
    if (this.resultados.length > 0) {
      const primerUsuario = this.resultados[0];
      this.seleccionarUsuario(primerUsuario);
    }
  }

  limpiarResultados(): void {
    this.resultados = [];
  }
}
