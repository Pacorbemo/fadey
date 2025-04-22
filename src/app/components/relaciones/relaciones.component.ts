import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { RouterModule } from '@angular/router';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-relaciones',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './relaciones.component.html',
  styleUrl: './relaciones.component.css'
})
export class RelacionesComponent implements OnInit {
  barberos: any[] = [];
  clientes: any[] = [];

  constructor(private relacionesService: RelacionesService, public datosService: DatosService) { }

  async ngOnInit(): Promise<void> {
    if (this.datosService.esCliente()){
      this.barberos = await this.relacionesService.getRelacionesCliente()
    }
    else if (this.datosService.esBarbero()){
      this.clientes = await this.relacionesService.getRelacionesBarbero()
      this.barberos = await this.relacionesService.getRelacionesCliente()
    }
  }

  eliminarRelacion(idRelacion: number): void {
    this.relacionesService.eliminarRelacion(idRelacion).then(() => {
      this.clientes = this.clientes.filter(r => r.id !== idRelacion);
      this.barberos = this.barberos.filter(r => r.id !== idRelacion);
    })
  }
}
