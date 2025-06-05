import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-cambiar-password',
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.css'],
  standalone: true,
  imports: [FormsModule, NgClass]
})
export class CambiarPasswordComponent {
  passwordActual: string = '';
  passwordNueva: string = '';
  passwordRepetir: string = '';
  cambiandoPassword: boolean = false;
  mensajePassword: string = '';
  verActual = false;
  verNueva = false;
  verRepetir = false;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordRepetir = false;
  fortalezaPassword = { texto: '', clase: '' };
  passwordRepetirInput = false;

  constructor(private usuariosService: UsuariosService) {}

  cambiarPassword() {
    this.mensajePassword = '';
    if (!this.passwordActual || !this.passwordNueva || !this.passwordRepetir) {
      this.mensajePassword = 'Completa todos los campos.';
      return;
    }
    if (this.passwordNueva.length < 6) {
      this.mensajePassword = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.passwordNueva !== this.passwordRepetir) {
      this.mensajePassword = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    this.cambiandoPassword = true;
    this.usuariosService.cambiarPassword({
      actual: this.passwordActual,
      nueva: this.passwordNueva
    }).subscribe({
      next: () => {
        this.mensajePassword = 'Contraseña cambiada correctamente.';
        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordRepetir = '';
        this.cambiandoPassword = false;
      },
      error: (err) => {
        this.mensajePassword = err?.error?.error || 'Error al cambiar la contraseña.';
        this.cambiandoPassword = false;
      }
    });
  }

  calcularFortalezaPassword() {
    const pwd = this.passwordNueva || '';
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length > 12) score++;
    if (!pwd || pwd.length < 6) {
      this.fortalezaPassword = { texto: '', clase: '' };
    } else if (score <= 2) {
      this.fortalezaPassword = { texto: 'Débil', clase: 'debil' };
    } else if (score <= 4) {
      this.fortalezaPassword = { texto: 'Media', clase: 'media' };
    } else {
      this.fortalezaPassword = { texto: 'Fuerte', clase: 'fuerte' };
    }
  }

  generarPasswordSegura() {
    const length = 14;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?';
    let password = '';
    while (true) {
      password = Array.from({length}, () => charset[Math.floor(Math.random() * charset.length)]).join('');
      // Ensure at least one lowercase, one uppercase, one digit, one symbol
      if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        break;
      }
    }
    this.passwordNueva = password;
    this.passwordRepetir = password;
    this.passwordRepetirInput = true;
    this.calcularFortalezaPassword();
  }
}
