import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  generarPasswordSegura(length: number = 14): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?';
    let password = '';
    while (true) {
      password = Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
      if (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
      ) {
        break;
      }
    }
    return password;
  }

  calcularFortaleza(password: string): { texto: string; clase: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length > 12) score++;
    if (!password || password.length < 6) {
      return { texto: '', clase: '' };
    } else if (score <= 2) {
      return { texto: 'Débil', clase: 'debil' };
    } else if (score <= 4) {
      return { texto: 'Media', clase: 'media' };
    } else {
      return { texto: 'Fuerte', clase: 'fuerte' };
    }
  }
}
