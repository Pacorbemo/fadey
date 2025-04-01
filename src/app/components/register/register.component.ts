import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ FormsModule ],
})
export class RegisterComponent {
  username: string = '';
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  barbero: boolean = true;
  password: string = '';
  confirmPassword: string = '';

  usernameValido: boolean = true; 
  emailValido: boolean = true;
  telefonoValido: boolean = true;

  mensajeErrorUsername: string = '';
  mensajeErrorEmail: string = '';
  mensajeErrorTelefono: string = '';

  esCliente:boolean = !this.barbero;

  constructor(
    private usuariosService: UsuariosService,
    private datosService: DatosService
  ) {}

  registrarUsuario(): void {
    if (this.password !== this.confirmPassword || !this.usernameValido || !this.emailValido) {
      alert('Corrige los errores antes de continuar.');
      return;
    }

    const usuario = {
      username: this.username.trim(),
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      barbero: this.barbero,
      telefono: this.telefono.trim(),
      password: this.password
    };

    this.usuariosService.registrar(usuario).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        this.datosService.tokenUsuario = response.token;
        localStorage.setItem('user', JSON.stringify(response.user));
        this.datosService.username = response.user.username;
        alert('Registro exitoso');
      },
      (error) => {
        alert('Error al registrar usuario');
      }
    );
  }

  verificarUsername(): void {
    if (this.username.trim() === '') {
      this.usernameValido = false;
      this.mensajeErrorUsername = 'El username no puede estar vacío.';
      return;
    }

    this.usuariosService.verificarUsername(this.username).subscribe(
      (response) => {
        this.usernameValido = !response.exists;
        this.mensajeErrorUsername = response.exists ? 'El username ya está en uso.' : '';
      },
      (error) => {
        console.error('Error al verificar el username:', error);
        this.usernameValido = false;
        this.mensajeErrorUsername = 'Error al verificar el username.';
      }
    );
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

  verificarTelefono(): void {
    this.telefono = this.telefono.trim();
  
    if (this.telefono === '') {
      this.telefonoValido = false;
      this.mensajeErrorTelefono = 'El teléfono no puede estar vacío.';
      return;
    }
  
    const telefonoPattern = /^[0-9]{9,15}$/;
    if (!telefonoPattern.test(this.telefono)) {
      this.telefonoValido = false;
      this.mensajeErrorTelefono = 'El teléfono debe contener entre 9 y 15 dígitos y solo números.';
      return;
    }

    this.usuariosService.verificarTelefono(this.telefono).subscribe(
      (response) => {
        this.telefonoValido = !response.exists;
        this.mensajeErrorTelefono = response.exists ? 'El teléfono ya está en uso.' : '';
      },
      (error) => {
        console.error('Error al verificar el teléfono:', error);
        this.telefonoValido = false;
        this.mensajeErrorTelefono = 'Error al verificar el teléfono.';
      }
    );
  }
}