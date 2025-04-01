import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../services/citas.service';
import { DatosService } from '../../services/datos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css'
})
export class MisCitasComponent implements OnInit {
  
  citas: {id:number, fecha_hora : Date, barbero_nombre : string, barbero_username:string}[] = [];

  constructor(
    private citasService: CitasService,
    private datosService: DatosService
  ){}

  ngOnInit(): void {
    this.citasService.getCitasUsuario(this.datosService.tokenUsuario).subscribe((citas) => {
      this.citas = citas;
    });
  }
}
