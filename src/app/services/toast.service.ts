import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastMensaje = string | { mensaje: string, sugerencia?: string };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private mensajeSubject = new BehaviorSubject<ToastMensaje>('');
  mensaje$ = this.mensajeSubject.asObservable();

  mostrar(error: any, respaldo: string = 'Ha ocurrido un error inesperado.') {
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
    setTimeout(() => {
      this.mensajeSubject.next('');
    }, 3500);
  }
}
