import { Injectable } from '@angular/core';

const oficiales = [
  'soporte', 'equipo', 'staff', 'admin', 'administrador', 'moderador', 'mod', 'root', 'system', 'sistema', 'oficial', 'ayuda', 'support', 'official', 'team', 'webmaster', 'dev', 'desarrollador', 'superuser', 'admin1', 'admin2', 'admin3', 'mod1', 'mod2', 'mod3',
];
const reservados = [
  'admin', 'root', 'superuser', 'crear-citas', 'registro', 'inicio-sesion', 'mis-citas', 'mis-productos', 'solicitudes', 'relaciones', 'chats', 'editar-perfil', 'mensajes', 'citas', 'productos', '**',
];

@Injectable({ providedIn: 'root' })
export class ValidacionesService {
  validarUsername(username: string): string | null {
    if (!username || username.trim() === '') {
      return 'El nombre de usuario es requerido';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    username = username.normalize('NFKC');
    if (username.length < 3 || username.length > 20) {
      return 'El nombre de usuario debe tener entre 3 y 20 caracteres';
    }
    if (username.startsWith('_') || username.endsWith('_')) {
      return 'El nombre de usuario no puede comenzar o terminar con un guion bajo';
    }
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username) || /^(http|www\.|https)/i.test(username)) {
      return 'El nombre de usuario es inválido';
    }
    if (/^\d+$/.test(username)) {
      return 'El nombre de usuario no puede ser solo números';
    }
    if (reservados.includes(username.toLowerCase()) || oficiales.includes(username.toLowerCase())) {
      return 'El nombre de usuario no está disponible';
    }
    return null;
  }

  validarEmail(email: string): string | null {
    if (!email || email.trim() === '') {
      return 'El email es requerido';
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return 'El email no es válido';
    }
    return null;
  }
}
