import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mis-citas-tabla',
  standalone: true,
  imports: [CommonModule],
  template: `
  <ul>
      <li class="header">
        <div class="col col-1">Fecha</div>
        <div class="col col-2">Nombre</div>
        <div class="col col-3">Username</div>
      </li>
      @for(cita of citas; track cita.id){
        <li class="row">
          <div class="col col-1">{{ cita.fecha_hora | date:'dd/MM hh:mm' }}</div>
          <div class="col col-2">{{ cita.usuario_nombre }}</div>
          <div class="col col-3">{{ '@' + cita.usuario_username }}</div>
        </li>
      }
    </ul>
  `,
  styleUrl: './tabla.component.css'
})
export class TablaComponent {
  @Input() citas: { id: number; fecha_hora: Date; usuario_nombre: string; usuario_username: string }[] = [];
}
