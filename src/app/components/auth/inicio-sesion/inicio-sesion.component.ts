import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { DatosService } from '../../../services/datos.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
  selector: 'app-login',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.css'],
  standalone: true,
  imports: [FormsModule, PasswordFieldComponent, RouterLink, CommonModule, ToastComponent],
})
export class InicioSesionComponent {
  username: string = '';
  password: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private datosService: DatosService,
    private router: Router,
    private toastService: ToastService
  ) {}

  iniciarSesion(): void {
    const credenciales = {
      username: this.username.trim(),
      password: this.password,
    };

    if (!credenciales.username || !credenciales.password) {
      this.toastService.error('Debes rellenar todos los campos. Por favor, introduce tu usuario y contraseña.');
      return;
    }

    this.usuariosService.login(credenciales).subscribe({
      next: (response) => {
        this.datosService.tokenUsuario = response.token;
        this.datosService.user = response.user        
        this.router.navigate(["/mis-citas"]);
      },
      error: (error) => {
        this.toastService.error(error);
      }
    });
  }
}