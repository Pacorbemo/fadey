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

  cargarMensajes(emisor_id: number, receptor_id: number): Observable<any> {
    const params = {
      emisor_id: emisor_id.toString(),
      receptor_id: receptor_id.toString(),
    };

    return this.httpService.httpGetToken('/mensajes', params);
  }

  cargarChats(): Observable<any> {
    return this.httpService.httpGetToken('/mensajes/chats');
  }
}
