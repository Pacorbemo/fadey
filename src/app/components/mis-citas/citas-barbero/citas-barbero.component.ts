import { Component } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';

@Component({
  selector: 'app-citas-barbero',
  standalone: true,
  imports: [TablaComponent],
  template: `
    @if(citasComoBarbero.length){
      <h3>Citas como Barbero</h3>
      <mis-citas-tabla [citas]="citasComoBarbero" />
    }
    @if(citasComoCliente.length){
      <h3>Citas como Cliente</h3>
      <mis-citas-tabla [citas]="citasComoCliente" />
    }
    @else if(citasComoBarbero.length == 0) {
      <h3>No tienes citas pendientes</h3>
    }
  `,
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
