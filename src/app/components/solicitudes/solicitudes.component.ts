import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})

export class SolicitudesComponent implements OnInit{
  solicitudes: any[] = [];

  constructor(private relacionesService: RelacionesService) { }
  
  async ngOnInit(): Promise<void> {
    this.solicitudes = await this.relacionesService.getSolicitudes()
    console.log(this.solicitudes)
  }

  aceptarSolicitud(idSolicitud: number): void {
    this.relacionesService.aceptarSolicitud(idSolicitud).then(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== idSolicitud);
    })
  }
  rechazarSolicitud(solicitud: any): void {
    this.relacionesService.rechazarSolicitud(solicitud).then(() => {
      this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
    })
    console.log('Solicitud rechazada:', solicitud);
  }
}
