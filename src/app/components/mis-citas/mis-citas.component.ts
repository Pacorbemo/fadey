import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasClienteComponent } from './citas-cliente/citas-cliente.component';
import { DatosService } from '../../services/datos.service';
import { CitasBarberoComponent } from './citas-barbero/citas-barbero.component';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, CitasClienteComponent, CitasBarberoComponent],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css'
})
export class MisCitasComponent {
  constructor(public datosService: DatosService) {} 
}
