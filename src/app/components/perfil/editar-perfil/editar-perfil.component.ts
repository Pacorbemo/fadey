import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatosService } from '../../../services/datos.service';
import { HttpService } from '../../../services/http.service';
import { UploadsPipe } from '../../../pipes/uploads.pipe';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { RouterLink } from '@angular/router';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PreferenciasHorarioBarberoComponent } from '../preferencias-horario-barbero/preferencias-horario-barbero.component';
import { ToastService } from '../../../services/toast.service';
import { ValidacionesService } from '../../../services/validaciones.service';
import { Usuario } from '../../../interfaces/usuario.interface';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [
    CommonModule,
    UploadsPipe,
    FormsModule,
    RouterLink,
    PreferenciasHorarioBarberoComponent,
  ],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css',
})
export class EditarPerfilComponent {
  imagenSeleccionada: File | null = null;
  imagenUrl: string | null = null;
  username: string = this.datosService.user.username;
  reenviandoEmail: boolean = false;
  mensajeVerificacion: string = '';
  notificacionesEmail: boolean = this.datosService.user.enviar_emails ?? false;
  mostrarDialogoEliminar: boolean = false;
  mensajeEliminacion: string = '';

  constructor(
    private httpService: HttpService,
    public datosService: DatosService,
    private usuariosService: UsuariosService,
    private toastService: ToastService,
    private validacionesService: ValidacionesService
  ) {}

  activarInput() {
    const inputFile = document.getElementById('fileInput');
    if (inputFile) {
      inputFile.click();
    } 
  }

  seleccionarImagen(event: any): void {
    this.imagenSeleccionada = event.target.files[0];
    this.subirImagen();
  }

  subirImagen(event?: Event): void {
    event?.preventDefault();
    if (!this.imagenSeleccionada) {
      this.toastService.error('Por favor, selecciona una imagen');
      return;
    }
    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);
    this.httpService.putToken('/usuarios/imagen-perfil', formData).subscribe({
      next: (response) => {
        this.datosService.actualizar('foto_perfil', response.fotoPerfil);
        this.toastService.mostrar(response);
      },
      error: () => {
        this.toastService.error('Error al subir la imagen');
      },
    });
  }

  async editar(campo: string, valor: string) {
    if (!valor.trim()) {
      return;
    }
    valor = valor.trim();
    if (campo === 'email') {
      const mensaje = this.validacionesService.validarEmail(valor);
      if (mensaje) {
        this.toastService.error(mensaje);
        return;
      }
    }
    if (campo === 'username') {
      let mensaje = this.validacionesService.validarUsername(valor);
      if (mensaje) {
        this.toastService.error(mensaje);
        return;
      }
      try {
        const response = await firstValueFrom(this.usuariosService.validarUsername(valor));
        if (!response.valido) {
          this.toastService.error('El nombre de usuario ya está en uso');
          return;
        }
      } catch (error) {
        this.toastService.error(error);
        return;
      }
    }
    this.httpService.putToken('/usuarios', { campo, valor }).subscribe({
      next: (response) => {
        this.toastService.mostrar(response)
        this.datosService.actualizar(campo as keyof Usuario, valor);
      },
      error: (error) => {
        this.toastService.error(error);
      },
    });
  }

  reenviarVerificacionEmail() {
    this.reenviandoEmail = true;
    this.mensajeVerificacion = '';
    this.usuariosService.enviarVerificacionEmail().subscribe({
      next: () => {
        this.mensajeVerificacion =
          'Email de verificación enviado. Revisa tu bandeja de entrada.';
        this.reenviandoEmail = false;
      },
      error: (err) => {
        this.mensajeVerificacion =
          err?.error?.error || 'Error al enviar el email de verificación.';
        this.reenviandoEmail = false;
      },
    });
  }

  toggleNotificacionesEmail() {
    this.notificacionesEmail = !this.notificacionesEmail;
    this.httpService
      .putToken('/usuarios', {
        campo: 'enviar_emails',
        valor: this.notificacionesEmail,
      })
      .subscribe({
        next: () => {
            this.datosService.actualizar('enviar_emails', this.notificacionesEmail);
        },
        error: () => {
          this.toastService.error(
            'No se pudo actualizar la preferencia de notificaciones.'
          );
          this.notificacionesEmail = !this.notificacionesEmail;
        },
      });
  }

  cambiarTipoCuenta() {
    const nuevoRol =
      this.datosService.user.rol === 'barbero' ? 'cliente' : 'barbero';
    this.httpService
      .putToken('/usuarios', {
        campo: 'barbero',
        valor: nuevoRol === 'barbero',
      })
      .subscribe({
        next: () => {
          this.datosService.actualizar('rol', nuevoRol);
          this.toastService.mostrar({ mensaje: `Ahora eres ${nuevoRol}.` });
        },
        error: () => {
          this.toastService.error('No se pudo cambiar el tipo de cuenta.');
        },
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
      await firstValueFrom(
        this.usuariosService.enviarConfirmacionEliminacion()
      );
      this.mensajeEliminacion =
        'Te hemos enviado un correo para confirmar la eliminación de tu cuenta.';
    } catch (err) {
      this.mensajeEliminacion = 'No se pudo enviar el correo de confirmación.';
    }
  }
}
