import { Component } from '@angular/core';
import { DatosService } from '../../../services/datos.service';
import { CitasService } from '../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';

@Component({
  selector: 'app-citas-barbero',
  standalone: true,
  imports: [TablaComponent],
  templateUrl: './citas-barbero.component.html',
})
export class CitasBarberoComponent {
  citasComoBarbero: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];
  citasComoCliente: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];

  constructor(
     private citasService: CitasService,
  ){}

  ngOnInit(): void {
    this.citasService.getCitasBarbero().subscribe((citas) => {
      this.citasComoBarbero = citas;
    });
    this.citasService.getCitasUsuario().subscribe((citas) => {
      this.citasComoCliente = citas;
    });
  }
}
