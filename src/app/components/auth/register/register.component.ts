import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { DatosService } from '../../../services/datos.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { ValidacionesService } from '../../../services/validaciones.service';
import { PasswordFieldComponent } from '../../shared/password-field/password-field.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ FormsModule, RouterLink, PasswordFieldComponent ],
})
export class RegisterComponent {
  username: string = '';
  nombre: string = '';
  email: string = '';
  barbero: boolean = true;
  password: string = '';
  confirmPassword: string = '';

  usernameValido: boolean = false; 
  emailValido: boolean = false;

  mensajeErrorUsername: string = '';
  mensajeErrorEmail: string = '';

  esCliente:boolean = !this.barbero;

  constructor(
    private usuariosService: UsuariosService,
    private datosService: DatosService,
    private router: Router,
    private toastService: ToastService,
    private validacionesService: ValidacionesService
  ) {}

  registrarUsuario(): void {

    // El resto de validaciones para enviar el formulario se realizan al desactivar el botón
    if (this.password !== this.confirmPassword) {
      this.toastService.error('Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      username: this.username.trim(),
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      barbero: this.barbero,
      password: this.password
    };

    this.usuariosService.registrar(usuario).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.datosService.tokenUsuario = response.token;
        localStorage.setItem('user', JSON.stringify(response.user));
        this.datosService.user = response.user;
        this.router.navigate(['/mis-citas']);
      },
      error: (error) => {
        this.toastService.error(error)
      }
    });
  }

  verificarUsername(): void {
    // Evitamos mostrar error si el usuario no ha introducido nada
    if (!this.username) {
      this.usernameValido = false;
      this.mensajeErrorUsername = '';
      return;
    }

    // Primero hace comprobaciones de formato y longitud
    const userInvalido = this.validacionesService.validarUsername(this.username);
    if (userInvalido) {
      this.usernameValido = false;
      this.mensajeErrorUsername = userInvalido;
      return;
    }

    // Finalmente verifica si el username ya está en uso
    this.usuariosService.validarUsername(this.username).subscribe({
      next: (response) => {
        this.usernameValido = response.valido;
        this.mensajeErrorUsername = '';
      },
      error: (error) => {
        if( error.status === 0) {
          this.toastService.error(error);
          return;
        }
        this.usernameValido = false;
        this.mensajeErrorUsername = error.error;
      }
    });
  }

  verificarEmail(): void {
    if (!this.email) {
      this.emailValido = false;
      this.mensajeErrorEmail = '';
      return;
    }

    const emailInvalido = this.validacionesService.validarEmail(this.email);
    if (emailInvalido) {
      this.emailValido = false;
      this.mensajeErrorEmail = emailInvalido;
      return;
    }

    this.usuariosService.verificarEmail(this.email).subscribe({
      next: (response) => {
        this.emailValido = !response.exists;
        this.mensajeErrorEmail = response.exists ? 'El correo electrónico ya está en uso.' : '';
      },
      error: (error) => {
        if( error.status === 0) {
          this.toastService.error(error);
          return;
        }
        this.emailValido = false;
        this.mensajeErrorEmail = error.error;
      }
    });
  }

  onPasswordGenerada(password: string): void {
    this.confirmPassword = password;
  }
}