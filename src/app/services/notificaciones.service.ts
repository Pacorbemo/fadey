import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { CargandoService } from './cargando.service';

export interface Notificacion {
  mensaje: string;
  leida: boolean;
  fecha: string;
  tipo: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  public notificaciones: Notificacion[] = [];

  constructor(
    private httpService: HttpService,
  ) { }

  obtenerNotificaciones(): void {
    this.httpService.httpGetToken('/notificaciones', undefined, true).subscribe(
      {
        next: (response: any) => {
          this.notificaciones = response;
        },
        error: (error: any) => {
          console.error('Error al obtener notificaciones:', error);
        }
      }
    )
  }

  marcarTodasLeidas(): void {
    this.httpService.httpPutToken('/notificaciones/leidas', undefined, true).subscribe(
      {
        next: () => {
          this.notificaciones.forEach(notificacion => notificacion.leida = true);
        },
        error: () => {
          console.error('Error al marcar todas las notificaciones como leídas');
        }
      }
    )
  }
}
