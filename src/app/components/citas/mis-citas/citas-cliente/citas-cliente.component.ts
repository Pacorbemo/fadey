import { Component } from '@angular/core';
import { CitasService } from '../../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';
import { CargandoService } from '../../../../services/cargando.service';

@Component({
  selector: 'app-citas-cliente',
  standalone: true,
  imports: [TablaComponent],
  template: `
    @if(!cargandoService.cargando){
      @if(citas.length){
        <mis-citas-tabla [citas]="citas" [pagina]="pagina" [limite]="limite" (paginaCambiada)="cambiarPagina($event)" />
      }@else {
       <p class="vacio">No tienes citas pendientes</p>
      }
    }
  `,
})
export class CitasClienteComponent {
  citas: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];
  pagina = 0;
  limite = 20;
  constructor(
    private citasService: CitasService,
    public cargandoService: CargandoService
 ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas() {
    this.citasService.getCitasUsuario({ limit: this.limite, offset: this.pagina * this.limite }).subscribe((citas) => {
      this.citas = citas;
      this.cargandoService.cargando = false;
    });
  }

  cambiarPagina(pagina: number) {
    this.pagina = pagina;
    this.cargarCitas();
  }
}
