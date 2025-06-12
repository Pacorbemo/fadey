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
  private sub: Subscription | undefined;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.mensaje$.subscribe((mensajeObj: any) => {
      if (typeof mensajeObj === 'object' && mensajeObj !== null) {
        this.mensaje = mensajeObj.mensaje || '';
        this.sugerencia = mensajeObj.sugerencia || '';
      } else {
        this.mensaje = mensajeObj || '';
        this.sugerencia = '';
      }
      this.visible = !!this.mensaje;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
