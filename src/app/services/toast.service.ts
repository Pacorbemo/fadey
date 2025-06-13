import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastMensaje = 
  | string
  | { 
      mensaje: string; 
      sugerencia?: string; 
      tipo?: 'error' | 'exito' | 'pregunta'; 
      onConfirmar?: () => void; 
      onCancelar?: () => void; 
    };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private mensajeSubject = new BehaviorSubject<ToastMensaje>('');
  mensaje$ = this.mensajeSubject.asObservable();

  private limpiarToast(duracion: number) {
    if (duracion >= 0) {
      setTimeout(() => this.mensajeSubject.next(''), duracion);
    }
  }

  error(error: any, duracion: number = 3500) {
    const respaldo = 'Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.';
    let mensaje = '';
    let sugerencia = '';

    if(error.status === 0){
      mensaje = 'No se pudo conectar al servidor.';
      sugerencia = 'Por favor, verifica tu conexión a Internet.';
      duracion = 10000;
    }
    else if (typeof error === 'string') {
      mensaje = error;
    } else if (error?.error) {
      const err = error.error;
      mensaje = typeof err === 'string' ? err : err?.mensaje || respaldo;
      sugerencia = err?.sugerencia || '';
    } else if (error?.mensaje) {
      mensaje = error.mensaje;
      sugerencia = error.sugerencia || '';
    } else {
      mensaje = respaldo;
    }

    this.mensajeSubject.next(sugerencia ? { mensaje, sugerencia, tipo: 'error' } : { mensaje, tipo: 'error' });
    this.limpiarToast(duracion);
  }

  mostrar(response: any, duracion: number = 3500) {
    const mensaje = typeof response === 'string' ? response : response?.mensaje || '';
    this.mensajeSubject.next({ mensaje, tipo: 'exito' });
    this.limpiarToast(duracion);
  }

  preguntar(mensaje: string, callback: () => void) {
    this.mensajeSubject.next({
      mensaje,
      tipo: 'pregunta',
      onConfirmar: () => {
        callback();
        this.mensajeSubject.next('');
      },
      onCancelar: () => this.mensajeSubject.next('')
    });
  }
}
