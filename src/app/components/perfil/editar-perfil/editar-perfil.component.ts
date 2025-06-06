import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatosService } from '../../../services/datos.service';
import { HttpService } from '../../../services/http.service';
import { UploadsPipe } from '../../../pipes/uploads.pipe';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, UploadsPipe, FormsModule, RouterLink],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  imagenSeleccionada: File | null = null;
  imagenUrl: string | null = null;
  username: string = this.datosService.user.username;
  reenviandoEmail = false;
  mensajeVerificacion: string = '';
  notificacionesEmail: boolean = this.datosService.user.enviar_emails ?? true;
  mostrarDialogoEliminar = false;
  mensajeEliminacion = '';

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

    this.httpService.putToken('/usuarios/imagen-perfil', formData).subscribe(
      (response) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.foto_perfil = response.imageUrl;
        localStorage.setItem('user', JSON.stringify(user));
        this.datosService.user.foto_perfil = response.imageUrl;
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
      const response = await firstValueFrom(this.usuariosService.verificarUsername(valor));
      if (response?.exists) {
        alert('El nombre de usuario ya está en uso');
        return;
      }
      this.datosService.user.username = valor;
    }

    this.httpService.putToken('/usuarios', { campo, valor }).subscribe({
      error: (error) => {
        console.error(`Error al actualizar el campo ${campo}:`, error);
        alert(`Error al actualizar el campo ${campo}`);
      }
    });
  }

  reenviarVerificacionEmail() {
    this.reenviandoEmail = true;
    this.mensajeVerificacion = '';
    this.usuariosService.enviarVerificacionEmail().subscribe({
      next: () => {
        this.mensajeVerificacion = 'Email de verificación enviado. Revisa tu bandeja de entrada.';
        this.reenviandoEmail = false;
      },
      error: (err) => {
        this.mensajeVerificacion = err?.error?.error || 'Error al enviar el email de verificación.';
        this.reenviandoEmail = false;
      }
    });
  }

  toggleNotificacionesEmail() {
    this.notificacionesEmail = !this.notificacionesEmail;
    this.httpService.putToken('/usuarios', { campo: 'enviar_emails', valor: this.notificacionesEmail })
      .subscribe({
        next: () => {
          this.datosService.user.enviar_emails = this.notificacionesEmail;
          localStorage.setItem('user', JSON.stringify(this.datosService.user));
        },
        error: () => {
          alert('No se pudo actualizar la preferencia de notificaciones.');
          this.notificacionesEmail = !this.notificacionesEmail; 
        }
      });
  }

  cambiarTipoCuenta() {
    const nuevoRol = this.datosService.user.rol === 'barbero' ? 'cliente' : 'barbero';
    this.httpService.putToken('/usuarios', { campo: 'barbero', valor: nuevoRol === 'barbero' })
      .subscribe({
        next: () => {
          this.datosService.user.rol = nuevoRol;
          localStorage.setItem('user', JSON.stringify(this.datosService.user));
          alert(`Ahora eres ${nuevoRol}.`);
        },
        error: () => {
          alert('No se pudo cambiar el tipo de cuenta.');
        }
      });
  }

  async confirmarEliminarCuenta() {
    this.mensajeEliminacion = '';
    if (!this.datosService.user.email_verificado) {
      try {
        await firstValueFrom(this.httpService.deleteToken('/usuarios'));
        this.mensajeEliminacion = 'Cuenta eliminada correctamente.';
      } catch (err) {
        this.mensajeEliminacion = 'Error al eliminar la cuenta.';
      }
      return;
    }
    try {
      await firstValueFrom(this.usuariosService.enviarConfirmacionEliminacion());
      this.mensajeEliminacion = 'Te hemos enviado un correo para confirmar la eliminación de tu cuenta.';
    } catch (err) {
      this.mensajeEliminacion = 'No se pudo enviar el correo de confirmación.';
    }
  }
}
