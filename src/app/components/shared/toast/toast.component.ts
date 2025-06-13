import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true
})
export class ToastComponent implements OnInit, OnDestroy {
  mensaje: string = '';
  sugerencia: string = '';
  visible: boolean = false;
  tipo: 'error' | 'exito' | 'pregunta' = 'error';
  private sub: Subscription | undefined;
  private onConfirmar?: () => void;
  private onCancelar?: () => void;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.mensaje$.subscribe((mensajeObj: any) => {
      if (typeof mensajeObj === 'object' && mensajeObj !== null) {
        this.mensaje = mensajeObj.mensaje || '';
        this.sugerencia = mensajeObj.sugerencia || '';
        this.tipo = mensajeObj.tipo || 'error';
        this.onConfirmar = mensajeObj.onConfirmar;
        this.onCancelar = mensajeObj.onCancelar;
      } else {
        this.mensaje = mensajeObj || '';
        this.sugerencia = '';
        this.tipo = 'error';
        this.onConfirmar = undefined;
        this.onCancelar = undefined;
      }
      this.visible = !!this.mensaje;
    });
  }

  confirmar() {
    if (this.onConfirmar) this.onConfirmar();
    this.visible = false;
  }
  cancelar() {
    if (this.onCancelar) this.onCancelar();
    this.visible = false;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
