import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Notificacion, NotificacionesService } from '../../../services/notificaciones.service';
import { ToastService } from '../../../services/toast.service';
import { DatosService } from '../../../services/datos.service';

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
  notificacionesCargadas: boolean = false;

  constructor(
    public notificacionesService: NotificacionesService,
    private elementRef: ElementRef,
    private toastService: ToastService,
    private datosService: DatosService
  ) {}

  ngOnInit(): void {
    const usuarioActual: number = this.datosService.user.id;
    this.notificacionesService.conectar(usuarioActual);
    this.notificacionesService.recibirNotificacion().subscribe((notificacion: Notificacion) => {
      this.notificacionesService.notificaciones.unshift(notificacion);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notificacionesAbierto && !this.elementRef.nativeElement.contains(event.target)) {
      this.alternarNotificaciones();
    }
  }

  alternarNotificaciones() {
    if (!this.notificacionesAbierto && !this.notificacionesCargadas) {
      this.notificacionesService.obtenerNotificaciones().subscribe(
      {
        next: (response: Notificacion[]) => {
          this.notificacionesService.notificaciones = response;
        },
        error: (error: any) => {
          this.toastService.error(error);
        },
        complete: () => {
          this.notificacionesCargadas = true;
        }
      })
    }
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
