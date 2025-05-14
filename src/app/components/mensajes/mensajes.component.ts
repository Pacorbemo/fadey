import { Component, OnInit } from '@angular/core';
import { MensajesService } from '../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CargandoService } from '../../services/cargando.service';
import { Usuario } from '../../interfaces/usuario';

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
  usuarioActual: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  receptor: Usuario = { id: 0, nombre: '', username: '', foto_perfil: '' };
  constructor(private mensajesService: MensajesService, private route: ActivatedRoute, private usuariosService: UsuariosService, public cargandoService: CargandoService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.receptor.username = params['username'];
    });
    this.usuariosService.datosUsername(this.receptor.username).subscribe((usuario) => {
      this.receptor = usuario;
      this.mensajesService.conectar(this.usuarioActual);
      this.mensajesService.cargarMensajes(this.usuarioActual, this.receptor.id).subscribe((mensajes: MensajeCargado[]) => {
        this.mensajes = mensajes;
        this.cargandoService.cargando = false;
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

  trackByIdx(index: number, item: any) {
    return index;
  }
}
