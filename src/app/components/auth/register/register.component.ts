import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { DatosService } from '../../../services/datos.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ FormsModule, RouterLink, ToastComponent ],
})
export class RegisterComponent {
  username: string = '';
  nombre: string = '';
  email: string = '';
  barbero: boolean = true;
  password: string = '';
  confirmPassword: string = '';

  usernameValido: boolean = true; 
  emailValido: boolean = true;

  mensajeErrorUsername: string = '';
  mensajeErrorEmail: string = '';

  esCliente:boolean = !this.barbero;

  constructor(
    private usuariosService: UsuariosService,
    private datosService: DatosService,
    private router: Router,
    private toastService: ToastService
  ) {}

  registrarUsuario(): void {
    if (this.password !== this.confirmPassword) {
      this.toastService.mostrar('Las contraseñas no coinciden.');
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
        const err = error.error?.error;
        let mensaje = typeof err === 'string' ? err : err?.mensaje || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
        let sugerencia = err?.sugerencia || '';
        this.toastService.mostrar(mensaje + (sugerencia ? ' ' + sugerencia : ''));
      }
    });
  }

  verificarUsername(): void {
    if (this.username.trim() === '') {
      this.usernameValido = false;
      this.mensajeErrorUsername = 'El username no puede estar vacío.';
      return;
    }

    this.usuariosService.validarUsername(this.username).subscribe({
      next: (response) => {
        this.usernameValido = response.valido;
        this.mensajeErrorUsername = '';
      },
      error: (error) => {
        this.usernameValido = false;
        this.mensajeErrorUsername = error.error;
      }
    });
  }

  verificarEmail(): void {
    this.email = this.email.trim();

    if (this.email === '') {
      this.emailValido = false;
      this.mensajeErrorEmail = 'El correo electrónico no puede estar vacío.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.emailValido = false;
      this.mensajeErrorEmail = 'El formato de correo electrónico no es válido.';
      return;
    }

    this.usuariosService.verificarEmail(this.email).subscribe(
      (response) => {
        this.emailValido = !response.exists;
        this.mensajeErrorEmail = response.exists ? 'El correo electrónico ya está en uso.' : '';
      },
      (error) => {
        console.error('Error al verificar el correo electrónico:', error);
        this.emailValido = false;
        this.mensajeErrorEmail = 'Error al verificar el correo electrónico.';
      }
    );
  }
}