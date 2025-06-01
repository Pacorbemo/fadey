import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Notificacion, NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent implements OnInit {

  notificacionesAbierto: boolean = false;
  fadeOut: boolean = false;

  constructor(
    public notificacionesService: NotificacionesService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.notificacionesService.obtenerNotificaciones();
    const usuarioActual: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
    this.notificacionesService.conectar(usuarioActual);
    this.notificacionesService.recibirNotificacion().subscribe((notificacion: Notificacion) => {
      this.notificacionesService.notificaciones.unshift(notificacion);
      // if (this.notificacionesAbierto) {
      //   this.notificacionesService.marcarTodasLeidas();
      // }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notificacionesAbierto && !this.elementRef.nativeElement.contains(event.target)) {
      this.alternarNotificaciones();
    }
  }

  alternarNotificaciones(): void {
    if (this.notificacionesAbierto) {
      this.fadeOut = true;
      setTimeout(() => {
        this.notificacionesAbierto = false;
        this.fadeOut = false;
      }, 200);
      if(!this.todasLeidas()){
        this.notificacionesService.marcarTodasLeidas();
      }
    } else {
      this.notificacionesAbierto = true;
    }
  }

  crearMensaje(notificacion: Notificacion): string {
    let mensaje = '';
    switch (notificacion.tipo) {
      case 'mensaje':
        mensaje = `Nuevo mensaje de ${notificacion.username}`;
        break;
      case 'cita':
        const fecha = new Date(notificacion.mensaje);
        mensaje = `Nueva cita de ${notificacion.username} para ${fecha.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} a las ${fecha.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
        break;
      case 'producto':
        const msg = JSON.parse(notificacion.mensaje);
        mensaje = `${notificacion.username} ha reservado ${msg.cantidad} ${msg.producto}`;
        break;
      case 'solicitud':
        mensaje = `${notificacion.username} te ha enviado una solicitud`;
        break;
      case 'relacion':
        mensaje = `${notificacion.username} ha ${notificacion.mensaje} tu solicitud`;
        break;
      default:
        mensaje = `Notificación de ${notificacion.username}`;
    }
    return mensaje;
  }

  todasLeidas(): boolean {
    return this.notificacionesService.notificaciones.every(notificacion => notificacion.leida == true);
  }
  
}
