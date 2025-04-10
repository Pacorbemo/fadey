import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class MensajesComponent implements OnInit {
  mensajes: any[] = [];
  mensaje: string = '';
  usuarioActual: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  receptorId: number = 12; // ID del usuario con el que estás chateando

  constructor(private mensajesService: MensajesService) {}

  ngOnInit(): void {
    // Cargar mensajes desde el backend
    this.mensajesService.cargarMensajes(this.usuarioActual, this.receptorId).subscribe((mensajes) => {
      this.mensajes = mensajes;
    });

    // Escuchar mensajes en tiempo real
    this.mensajesService.recibirMensajes().subscribe((mensaje: any) => {
      this.mensajes.push(mensaje);
    });
  }

  enviarMensaje(): void {
    if (this.mensaje.trim()) {
      this.mensajesService.enviarMensaje(this.usuarioActual, this.receptorId, this.mensaje);
      this.mensajes.push({
        emisor_id: this.usuarioActual,
        mensaje: this.mensaje,
        fecha_envio: new Date(),
      });
      this.mensaje = '';
    }
  }
}
