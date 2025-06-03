import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { HttpService } from '../../services/http.service';
import { UploadsPipe } from '../../pipes/uploads.pipe';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, UploadsPipe, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  imagenSeleccionada: File | null = null;
  imagenUrl: string | null = null;
  username: string = this.datosService.user.username;

  constructor(
    private httpService: HttpService,
    public datosService: DatosService,
    private usuariosService: UsuariosService
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

  async editar(campo: string, valor: string) {
    if (!valor.trim()) {
      return;
    }
    valor = valor.trim();

    if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      alert('Por favor, introduce un email válido');
      return;
    }
    if (campo === 'localizacion' && valor.length > 30) {
      alert('La localización no puede exceder los 30 caracteres');
      return;
    }

    if(campo === 'username'){
      if (valor.length < 3 || valor.length > 20) {
        alert('El nombre de usuario debe tener entre 3 y 20 caracteres');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(valor)) {
        alert('El nombre de usuario solo puede contener letras, números y guiones bajos');
        return;
      }
      const response = await this.usuariosService.verificarUsername(valor).toPromise()
      if (response?.exists) {
        alert('El nombre de usuario ya está en uso');
        return;
      }
      this.datosService.user.username = valor;
    }

    this.httpService.httpPutToken('/usuarios', { campo, valor }).subscribe({
      error: (error) => {
        console.error(`Error al actualizar el campo ${campo}:`, error);
        alert(`Error al actualizar el campo ${campo}`);
      }
    });
  }
}
