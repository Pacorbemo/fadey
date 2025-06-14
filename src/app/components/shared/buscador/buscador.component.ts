import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuscadorService } from '../../../services/buscador.service';
import { DatosService } from '../../../services/datos.service';
import { UploadsPipe } from '../../../pipes/uploads.pipe';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadsPipe],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css',
})
export class BuscadorComponent {
  constructor(public buscadorService: BuscadorService, public datosService:DatosService) {}

  mostrarResultados : boolean = false;

  @HostListener('document:click', ['$event'])
  cerrarMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const buscador = document.querySelector('.form-control');
    if (buscador && !buscador.contains(target)) {
      this.mostrarResultados = false;
    }
  }
}