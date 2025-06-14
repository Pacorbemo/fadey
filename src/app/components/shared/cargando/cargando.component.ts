import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cargando',
  standalone: true,
  template: `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-message">{{ mensaje || 'Cargando, por favor espera...' }}</div>
    </div>
  `,
  styleUrls: ['./cargando.component.css']
})
export class CargandoComponent {
  @Input() mensaje?: string;
}
