import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mis-citas-tabla',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="tabla-wrapper">
    <ul class="tabla-ul">
      <li class="header">
        <div class="col col-1">Fecha</div>
        <div class="col col-2">Nombre</div>
        <div class="col col-3">Usuario</div>
      </li>
      @for(cita of citas; track cita.id){
        <li class="row">
          <div class="col col-1">{{ cita.fecha_hora | date:'dd/MM HH:mm' }}</div>
          <div class="col col-2">{{ cita.usuario_nombre }}</div>
          <div class="col col-3">
            <a [routerLink]="['/',cita.usuario_username]">
              {{ '@' + cita.usuario_username }}
            </a>
          </div>
        </li>
      }
    </ul>
    <div class="paginacion">
      <button (click)="anteriorPagina()" [disabled]="pagina === 0">Anterior</button>
      <span>Página {{pagina + 1}}</span>
      <button (click)="siguientePagina()" [disabled]="citas.length < limite">Siguiente</button>
    </div>
  </div>
  `,
  styleUrl: './tabla.component.css'
})
export class TablaComponent {
  @Input() citas: { id: number; fecha_hora: Date; usuario_nombre: string; usuario_username: string }[] = [];
  @Input() pagina = 0;
  @Input() limite = 20;
  @Output() paginaCambiada = new EventEmitter<number>();

  anteriorPagina() {
    if (this.pagina > 0) {
      this.paginaCambiada.emit(this.pagina - 1);
    }
  }
  siguientePagina() {
    if (this.citas.length >= this.limite) {
      this.paginaCambiada.emit(this.pagina + 1);
    }
  }
}
