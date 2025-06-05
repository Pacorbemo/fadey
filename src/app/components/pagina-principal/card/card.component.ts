import { Component, Input } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario.interface';
import { DatosService } from '../../../services/datos.service';
import { UploadsPipe } from '../../../pipes/uploads.pipe';

@Component({
  selector: 'pagina-principal-card',
  standalone: true,
  imports: [UploadsPipe],
  template: `
    <div class="card">
      <div class="imagen-container">
        <img [src]="(barbero.foto_perfil | uploads )|| datosService.noFoto" alt="{{barbero.nombre}}" class="card-img-top" />
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
