import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { ToastService } from '../../../services/toast.service';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
  selector: 'app-cambiar-password',
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.css'],
  standalone: true,
  imports: [FormsModule, PasswordFieldComponent]
})
export class CambiarPasswordComponent {

  passwordActual: string = '';
  nuevaPassword: string = '';
  repetirPassword: string = '';

  cambiandoPassword: boolean = false;

  constructor(private usuariosService: UsuariosService, private toastService: ToastService) {}

  cambiarPassword() {
    if (this.nuevaPassword !== this.repetirPassword) {
      this.toastService.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    this.cambiandoPassword = true;
    this.usuariosService.cambiarPassword({
      actual: this.passwordActual,
      nueva: this.nuevaPassword
    }).subscribe({
      next: () => {
        this.toastService.mostrar('Contraseña cambiada correctamente.');
        this.passwordActual = '';
        this.nuevaPassword = '';
        this.repetirPassword = '';
        this.cambiandoPassword = false;
      },
      error: (err) => {
        this.toastService.error(err);
        this.cambiandoPassword = false;
      }
    });
  }

  onPasswordGenerada(password: string): void {
    this.repetirPassword = password;
  }
}
