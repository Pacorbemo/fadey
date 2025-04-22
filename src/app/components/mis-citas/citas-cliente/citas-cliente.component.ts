import { Component } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { DatosService } from '../../../services/datos.service';
import { TablaComponent } from '../tabla/tabla.component';

@Component({
  selector: 'app-citas-cliente',
  standalone: true,
  imports: [TablaComponent],
  templateUrl: './citas-cliente.component.html',
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
