import { Component, OnInit } from '@angular/core';
import { RelacionesService, Relacion } from '../../services/relaciones.service';
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
  styleUrl: './relaciones.component.css',
})
export class RelacionesComponent implements OnInit {
  busqueda: string = '';
  barberos = {
    todos: [] as Relacion[],
    filtrados: [] as Relacion[]
  }
  clientes = {
    todos : [] as Relacion[],
    filtrados: [] as Relacion[]
  }

  constructor(
    private relacionesService: RelacionesService,
    public datosService: DatosService,
    public cargandoService: CargandoService
  ) {}

  ngOnInit(): void {
    this.relacionesService.getRelacionesCliente().subscribe({
      next: (barberos) => {
        this.barberos.todos = barberos;
        this.barberos.filtrados = barberos;
      },
    });
    if (this.datosService.esBarbero()) {
      this.relacionesService.getRelacionesBarbero().subscribe({
        next: (clientes) => {
          this.clientes.todos = clientes;
          this.clientes.filtrados = clientes;
        },
      });
    }
  }

  eliminarRelacion(idRelacion: number): void {
    this.relacionesService.eliminarRelacion(idRelacion).subscribe({
      next: () => {
        this.clientes.todos = this.clientes.todos.filter((r) => r.id !== idRelacion);
        this.barberos.todos = this.barberos.todos.filter((r) => r.id !== idRelacion);
      },
    });
  }

  filtrar(): void {
    this.barberos.filtrados = this.barberos.todos.filter((barbero) => {
      return (
        barbero.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        barbero.username.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    });
    this.clientes.filtrados = this.clientes.todos.filter((cliente) => {
      return (
        cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        cliente.username.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    });
  }
}
