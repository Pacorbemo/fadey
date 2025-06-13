import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Socket } from 'ngx-socket-io';
import { ToastService } from './toast.service';
import { Observable } from 'rxjs';

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
    private socket: Socket,
    private toastService: ToastService
  ) { }

  obtenerNotificaciones(): Observable<Notificacion[]> {
    return this.httpService.getToken('/notificaciones', undefined, true)
  }

  marcarTodasLeidas(): void {
    this.httpService.putToken('/notificaciones/leidas', undefined, true).subscribe(
      {
        next: () => {
          this.notificaciones.forEach(notificacion => notificacion.leida = true);
        },
        error: (err) => {
            this.toastService.error(err);
        }
      }
    )
  }

  conectar(emisor_id: number): void {
    this.socket.emit('registro', emisor_id);
  }

  recibirNotificacion() {
    return this.socket.fromEvent('nuevaNotificacion');
  }
}
