import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastMensaje = string | { 
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

  error(error: any, duracion: number = 3500) {
    const respaldo = 'Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.';
    let mensaje = '';
    let sugerencia = '';
    if (typeof error === 'string') {
      mensaje = error;
    } 
    else if (error?.error) {
      const err = error.error;
      mensaje = typeof err === 'string' ? err : err?.mensaje || respaldo;
      if (err?.sugerencia) {
        sugerencia = err.sugerencia;
      }
    } 
    else if (error?.mensaje) {
      mensaje = error.mensaje;
      if (error.sugerencia) {
        sugerencia = error.sugerencia;
      }
    } else {
      mensaje = respaldo;
    }
    if (sugerencia) {
      this.mensajeSubject.next({ mensaje, sugerencia });
    } else {
      this.mensajeSubject.next(mensaje);
    }

    if(duracion >= 0) {
      setTimeout(() => {
        this.mensajeSubject.next('');
      }, duracion);
    }
  }

  mostrar(response: any, duracion: number = 3500) {
	let mensaje;
	if(typeof response === 'string') {
		mensaje = response;
	} else if (typeof response === 'object' && response !== null) {
		mensaje = response.mensaje;
	}
    this.mensajeSubject.next({ mensaje, tipo: 'exito' });
    if(duracion >= 0) {
      setTimeout(() => {
        this.mensajeSubject.next('');
      }, duracion);
    }
  }

  preguntar(mensaje: string, callback: () => void) {
    this.mensajeSubject.next({
      mensaje,
      tipo: 'pregunta',
      onConfirmar: () => {
        callback();
        this.mensajeSubject.next('');
      },
      onCancelar: () => {
        this.mensajeSubject.next('');
      }
    });
  }
}
