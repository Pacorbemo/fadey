import { Component } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';
import { CargandoService } from '../../../services/cargando.service';

@Component({
  selector: 'app-citas-barbero',
  standalone: true,
  imports: [TablaComponent],
  template: `
    @if(!cargandoService.cargando){
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
    }
  `,
})
export class CitasBarberoComponent {
  citasComoBarbero: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];
  citasComoCliente: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];

  constructor(
     private citasService: CitasService,
     public cargandoService: CargandoService
  ){}

  ngOnInit(): void {
    let citasCargadas = 0;
    const finalizarCargando = () => {
      citasCargadas++;
      if (citasCargadas === 2) {
        this.cargandoService.cargando = false;
      }
    };

    this.citasService.getCitasBarbero().subscribe({
      next: (citas) => {
        this.citasComoBarbero = citas;
        finalizarCargando();
      }
    });
    this.citasService.getCitasUsuario().subscribe({
      next: (citas) => {
        this.citasComoCliente = citas;
        finalizarCargando();
      }
    });
  }
}
