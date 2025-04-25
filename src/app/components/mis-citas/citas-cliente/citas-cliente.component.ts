import { Component } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { TablaComponent } from '../tabla/tabla.component';

@Component({
  selector: 'app-citas-cliente',
  standalone: true,
  imports: [TablaComponent],
  template: `
    @if(citas.length){
      <mis-citas-tabla [citas]="citas"/>
    }@else {
      <h3>No tienes citas pendientes</h3>
    }
  `,
})
export class CitasClienteComponent {
  citas: {id:number, fecha_hora : Date, usuario_nombre : string, usuario_username:string}[] = [];
 constructor(
    private citasService: CitasService,
  ){}

  ngOnInit(): void {
    this.citasService.getCitasUsuario().subscribe((citas) => {
      this.citas = citas;
    });
  }
}
