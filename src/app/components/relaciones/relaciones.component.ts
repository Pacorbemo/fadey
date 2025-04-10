import { Component, OnInit } from '@angular/core';
import { RelacionesService } from '../../services/relaciones.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-relaciones',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './relaciones.component.html',
  styleUrl: './relaciones.component.css'
})
export class RelacionesComponent implements OnInit {
  relaciones: any[] = [];

  constructor(private relacionesService: RelacionesService) { }

  async ngOnInit(): Promise<void> {
    this.relaciones = await this.relacionesService.getRelaciones('aceptado')
    console.log(this.relaciones)
  }

  eliminarRelacion(idRelacion: number): void {
    this.relacionesService.eliminarRelacion(idRelacion).then(() => {
      this.relaciones = this.relaciones.filter(r => r.id !== idRelacion);
    })
  }
}
