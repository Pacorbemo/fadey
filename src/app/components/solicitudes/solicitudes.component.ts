import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { CommonModule } from '@angular/common';
import { CargandoService } from '../../services/cargando.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})

export class SolicitudesComponent implements OnInit{
[x: string]: any;
  solicitudes: any[] = [];

  constructor(private relacionesService: RelacionesService, public cargandoService: CargandoService) { }
  
  async ngOnInit(): Promise<void> {
    this.solicitudes = await this.relacionesService.getSolicitudes()
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
  }
}
