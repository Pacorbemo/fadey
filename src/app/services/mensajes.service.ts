import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  constructor(private httpService: HttpService, private socket: Socket) {}

  conectar(emisor_id: number): void {
    this.socket.emit('registro', emisor_id);
  }

  enviarMensaje(emisor_id: number, receptor_id: number, mensaje: string): void {
    this.socket.emit('enviarMensaje', { emisor_id, receptor_id, mensaje });
  }

  recibirMensajes() {
    return this.socket.fromEvent('nuevoMensaje');
  }

  cargarMensajes(receptor_id: number, limit: number = 30, offset: number = 0): Observable<any> {
    const params = {
      receptor_id: receptor_id.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    };

    return this.httpService.getToken('/mensajes', params);
  }

  cargarChats(): Observable<any> {
    return this.httpService.getToken('/mensajes/chats');
  }

  marcarMensajesLeidos(emisor_id: number) {
    return this.httpService.postToken('/mensajes/marcar-leidos', { emisor_id });
  }
}
