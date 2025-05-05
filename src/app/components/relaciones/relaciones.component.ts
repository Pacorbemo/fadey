import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { RouterModule } from '@angular/router';
import { DatosService } from '../../services/datos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-relaciones',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './relaciones.component.html',
  styleUrl: './relaciones.component.css'
})
export class RelacionesComponent implements OnInit {
  barberos: any[] = [];
  barberosFiltrados: any[] = [];
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  busqueda: string = '';

  constructor(private relacionesService: RelacionesService, public datosService: DatosService) { }

  async ngOnInit(): Promise<void> {
    if (this.datosService.esCliente()){
      this.barberos = await this.relacionesService.getRelacionesCliente()
      this.barberosFiltrados = this.barberos
    }
    else if (this.datosService.esBarbero()){
      this.clientes = await this.relacionesService.getRelacionesBarbero()
      this.barberos = await this.relacionesService.getRelacionesCliente()
      this.clientesFiltrados = this.clientes
      this.barberosFiltrados = this.barberos
    }
  }

  eliminarRelacion(idRelacion: number): void {
    this.relacionesService.eliminarRelacion(idRelacion).then(() => {
      this.clientes = this.clientes.filter(r => r.id !== idRelacion);
      this.barberos = this.barberos.filter(r => r.id !== idRelacion);
    })
  }

  filtrar(): void {
    this.barberosFiltrados = this.barberos.filter(barbero => {
      return barbero.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
             barbero.username.toLowerCase().includes(this.busqueda.toLowerCase())    });
    this.clientesFiltrados = this.clientes.filter(cliente => {
      return cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
             cliente.username.toLowerCase().includes(this.busqueda.toLowerCase())    });
  }
}
