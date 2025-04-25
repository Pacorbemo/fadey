import { Component, Input } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { DatosService } from '../../../services/datos.service';

@Component({
  selector: 'pagina-principal-card',
  standalone: true,
  imports: [],
  template: `
    <div class="card">
      <div class="imagen-container">
        <img [src]="barbero.foto_perfil || datosService.noFoto" alt="{{barbero.nombre}}" class="card-img-top" />
      </div>
      <p class="heading">{{barbero.nombre}}</p>
      <p>{{'@' + barbero.username}}</p>
    </div>
  `,
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() barbero!: Usuario; 

  constructor(public datosService: DatosService) { }
}
