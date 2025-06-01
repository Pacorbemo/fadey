import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { HttpService } from '../../services/http.service';
import { UploadsPipe } from '../../pipes/uploads.pipe';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, UploadsPipe],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  imagenSeleccionada: File | null = null;
  imagenUrl: string | null = null;

  constructor(
    private httpService: HttpService,
    public datosService: DatosService
  ) {}

  activarInput() {
    const inputFile = document.getElementById('fileInput');
    if (inputFile) {
      inputFile.click();
    } else {
      console.error('El elemento con id "fileInput" no se encontró.');
    }
  }

  seleccionarImagen(event: any): void {
    this.imagenSeleccionada = event.target.files[0];
    this.subirImagen();
  }

  subirImagen(event?: Event): void {
    event?.preventDefault();
    if (!this.imagenSeleccionada) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    this.httpService.httpPutToken('/usuarios/imagen-perfil', formData).subscribe(
      (response) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.pic = response.imageUrl;
        localStorage.setItem('user', JSON.stringify(user));
        this.datosService.user.pic = response.imageUrl;
        alert('Imagen subida correctamente');
      },
      (error) => {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen');
      }
    );
  }

  editarNombre(){
    const nombreElemento = document.getElementById('nombre');
    if (nombreElemento) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = this.datosService.user.nombre;
      input.id = 'nombre';
      input.style.fontSize = '24px';
      input.style.fontWeight = 'bold';
      input.addEventListener('blur', () => {
        this.datosService.user.nombre = input.value;
        input.replaceWith(nombreElemento);  
        this.httpService.httpPutToken('/usuarios/nombre', { nombre: input.value }).subscribe({
          error: (error) => {
            console.error('Error al actualizar el nombre:', error);
            alert('Error al actualizar el nombre');
          }
        })
      });
      nombreElemento.replaceWith(input);
      setTimeout(() => {
        input.focus();
        input.select();
      }, 0);
    }
  }
}
