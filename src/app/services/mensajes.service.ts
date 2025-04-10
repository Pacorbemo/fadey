import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { DatosService } from './datos.service';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  constructor(private http: HttpClient, private socket: Socket, private datosService: DatosService) {}

  enviarMensaje(emisor_id: number, receptor_id: number, mensaje: string): void {
    this.socket.emit('enviarMensaje', { emisor_id, receptor_id, mensaje });
  }

  recibirMensajes() {
    return this.socket.fromEvent('nuevoMensaje');
  }

  cargarMensajes(emisor_id: number, receptor_id: number): Observable<any> {
    const token = this.datosService.tokenUsuario;

    return this.http.get(`/mensajes`, {
      params: {
        emisor_id: emisor_id.toString(),
        receptor_id: receptor_id.toString(),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
