import { Component } from '@angular/core';
import { CitasService } from '../../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';
import { CargandoService } from '../../../../services/cargando.service';

@Component({
  selector: 'app-citas-barbero',
  standalone: true,
  imports: [TablaComponent],
  template: `
    @if(!cargandoService.cargando){
      @if(citasComoBarbero.length){
        <h3>Citas como Barbero</h3>
        <mis-citas-tabla [citas]="citasComoBarbero" [pagina]="paginaBarbero" [limite]="limite" (paginaCambiada)="cambiarPaginaBarbero($event)" />
      }
      @if(citasComoCliente.length){
        <h3>Citas como Cliente</h3>
        <mis-citas-tabla [citas]="citasComoCliente" [pagina]="paginaCliente" [limite]="limite" (paginaCambiada)="cambiarPaginaCliente($event)" />
      }
      @else if(citasComoBarbero.length == 0) {
        <p class="vacio">No tienes citas pendientes</p>
      }
    }
  `,
})
export class CitasBarberoComponent {
  citasComoBarbero: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];
  citasComoCliente: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];

  paginaBarbero = 0;
  paginaCliente = 0;
  limite = 20;

  constructor(
     private citasService: CitasService,
     public cargandoService: CargandoService
  ){}

  private pendientesCargas = 2;

  finalizarCargando() {
    this.pendientesCargas--;
    if (this.pendientesCargas === 0) {
      this.cargandoService.cargando = false;
      this.pendientesCargas = 2;
    }
  }
  
  cargarCitasBarbero() {
    this.citasService.getCitasBarbero({ limit: this.limite, offset: this.paginaBarbero * this.limite }).subscribe({
      next: (citas) => {
        this.citasComoBarbero = citas;
        this.finalizarCargando();
      }
    });
  }

  cargarCitasCliente() {
    this.citasService.getCitasUsuario({ limit: this.limite, offset: this.paginaCliente * this.limite }).subscribe({
      next: (citas) => {
        this.citasComoCliente = citas;
        this.finalizarCargando();
      }
    });
  }

  ngOnInit(): void {
    this.cargarCitasBarbero();
    this.cargarCitasCliente();
  }

  cambiarPaginaBarbero(pagina: number) {
    this.paginaBarbero = pagina;
    this.cargarCitasBarbero();
    this.cargandoService.cargando = false;
  }

  cambiarPaginaCliente(pagina: number) {
    this.paginaCliente = pagina;
    this.cargarCitasCliente();
    this.cargandoService.cargando = false;
  }
}
