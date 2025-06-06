import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { DatosService } from '../../../services/datos.service';

@Component({
  selector: 'app-confirmar-eliminacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-eliminacion.component.html',
  styleUrls: ['./confirmar-eliminacion.component.css']
})
export class ConfirmarEliminacionComponent {
  estado: 'ok' | 'error' | '' = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private datosService: DatosService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.confirmarEliminacion();
    });
  }

  confirmarEliminacion() {
    if (!this.token) {
      this.estado = 'error';
      return;
    }
    this.httpService.post('/usuarios/confirmar-eliminacion', { token: this.token }).subscribe({
      next: () => {
        this.estado = 'ok';
        this.datosService.limpiarUser();
      },
      error: () => {
        this.estado = 'error';
      }
    });
  }
}
