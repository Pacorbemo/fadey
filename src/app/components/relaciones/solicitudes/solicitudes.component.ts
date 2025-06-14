import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../../services/relaciones.service';
import { CommonModule } from '@angular/common';
import { CargandoService } from '../../../services/cargando.service';
import { Router } from '@angular/router';
import { CargandoComponent } from '../../shared/cargando/cargando.component';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, CargandoComponent],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css'
})

export class SolicitudesComponent implements OnInit{
  solicitudes: any[] = [];

  constructor(
    private relacionesService: RelacionesService,
    public cargandoService: CargandoService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.relacionesService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
      }
    });
  }

  aceptarSolicitud(idSolicitud: number): void {
    this.relacionesService.aceptarSolicitud(idSolicitud).subscribe({
      next: () => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== idSolicitud);
      }
    });
  }
  rechazarSolicitud(solicitud: any): void {
    this.relacionesService.rechazarSolicitud(solicitud.id).subscribe({
      next: () => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
      }
    });
  }

  irPerfil(username: string): void {
    this.router.navigate(['/', username]);
  }
}
