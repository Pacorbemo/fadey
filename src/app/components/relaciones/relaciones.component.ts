import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { RouterModule } from '@angular/router';
import { DatosService } from '../../services/datos.service';
import { FormsModule } from '@angular/forms';
import { CargandoService } from '../../services/cargando.service';
import { CommonModule } from '@angular/common';
import { CargandoComponent } from '../shared/cargando/cargando.component';

@Component({
  selector: 'app-relaciones',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, CargandoComponent],
  templateUrl: './relaciones.component.html',
  styleUrl: './relaciones.component.css'
})
export class RelacionesComponent implements OnInit {
  barberos: any[] = [];
  barberosFiltrados: any[] = [];
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  busqueda: string = '';

  constructor(private relacionesService: RelacionesService, public datosService: DatosService, public cargandoService: CargandoService) { }

  ngOnInit(): void {
    if (this.datosService.esCliente()) {
      this.relacionesService.getRelacionesCliente().subscribe({
        next: barberos => {
          this.barberos = barberos;
          this.barberosFiltrados = this.barberos;
        }
      });
    }
    else if (this.datosService.esBarbero()) {
      this.relacionesService.getRelacionesBarbero().subscribe({
        next: clientes => {
          this.clientes = clientes;
          this.clientesFiltrados = this.clientes;
        }
      });
      this.relacionesService.getRelacionesCliente().subscribe({
        next: barberos => {
          this.barberos = barberos;
          this.barberosFiltrados = this.barberos;
        }
      });
    }
  }

  eliminarRelacion(idRelacion: number): void {
    this.relacionesService.eliminarRelacion(idRelacion).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(r => r.id !== idRelacion);
        this.barberos = this.barberos.filter(r => r.id !== idRelacion);
      }
    });
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
