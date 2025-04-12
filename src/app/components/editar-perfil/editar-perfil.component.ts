import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  imagenSeleccionada: File | null = null;
  imagenUrl: string | null = null;

  constructor(private http: HttpClient, public datosService:DatosService) {}

  seleccionarImagen(event: any): void {
    this.imagenSeleccionada = event.target.files[0];
  }

  subirImagen(event: Event): void {
    event.preventDefault();
    if (!this.imagenSeleccionada) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);
    const token = this.datosService.tokenUsuario;
    this.http.post<{ imageUrl: string }>('/subir-imagen', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }}).subscribe(
      (response) => {
        this.imagenUrl = response.imageUrl;
        alert('Imagen subida correctamente');
      },
      (error) => {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen');
      }
    );
  }
}
