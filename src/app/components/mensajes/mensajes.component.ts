import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

interface MensajeCargado{
  emisor_id:number,
  mensaje: string,
  receptor_id: number,
  fecha_envio: Date,
  id: number,
  leido: boolean,
}

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
  cargando : boolean = true;
  usuarioActual: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  receptor : {id: number, username: string} = {id: 0, username: ''};
  constructor(private mensajesService: MensajesService, private route: ActivatedRoute, private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.receptor.username = params['username'];
    });
    this.usuariosService.verificarUsername(this.receptor.username).subscribe((usuario) => {
      this.receptor.id = usuario?.idBarbero || 0;
      this.mensajesService.cargarMensajes(this.usuarioActual, this.receptor.id).subscribe((mensajes: MensajeCargado[]) => {
        this.mensajes = mensajes;
        this.cargando = false;
      });
    });
    this.mensajesService.recibirMensajes().subscribe((mensaje: any) => {
      this.mensajes.push(mensaje);
    })
  }

  enviarMensaje(): void {
    if (this.mensaje.trim()) {
      this.mensajesService.enviarMensaje(this.usuarioActual, this.receptor.id, this.mensaje);
      this.mensajes.push({
        emisor_id: this.usuarioActual,
        mensaje: this.mensaje,
        fecha_envio: new Date(),
      });
      this.mensaje = '';
    }
  }
}
