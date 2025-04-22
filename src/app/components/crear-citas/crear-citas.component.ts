import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../services/citas.service';
import { DateMesStringPipe } from '../../pipes/date-mes-string.pipe';
import { ArrayCitasInterface } from '../../interfaces/citas.interface';

@Component({
  selector: 'app-crear-citas',
  templateUrl: './crear-citas.component.html',
  styleUrls: ['./crear-citas.component.css'],
  standalone: true,
  imports: [DateMesStringPipe]
})
export class CrearCitasComponent implements OnInit {
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  idBarbero: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);

  seleccionando: boolean = false;
  agregando: boolean = false;

  fechasSubidas: ArrayCitasInterface = [];
  franjasSeleccionadas: ArrayCitasInterface = [];
  ultimasFranjasSeleccionadas: ArrayCitasInterface = [];

  constructor(private citasService: CitasService) {}

  async ngOnInit(): Promise<void> {
    this.diasDeLaSemana = this.citasService.calcularSemana(new Date());
    this.recargarFechasSubidas();    
    this.franjasHorarias = this.citasService.generarFranjasHorarias();
  }

  recargarFechasSubidas(): void {
    this.citasService.getCitas(this.idBarbero, this.diasDeLaSemana[0]).then((fechas) => {
      this.fechasSubidas = fechas.totales;
    });
  }

  async cambiarSemana(n: number) {
    this.diasDeLaSemana = this.citasService.calcularSemana(this.diasDeLaSemana[0], n);
    this.recargarFechasSubidas();
  }

  horaEnFranja(dia: Date, hora: string, franja : ArrayCitasInterface = this.franjasSeleccionadas): boolean {
    return franja[dia.getDate()]?.includes(hora)
  }

  empezarSeleccion(dia: Date, hora: string): void {
    this.seleccionando = true;
    this.ultimasFranjasSeleccionadas = this.franjasSeleccionadas;
    this.agregando = !this.horaEnFranja(dia, hora);
    this.alternarSeleccion(dia, hora);
  }

  continuarSeleccion(dia: Date, hora: string, event: MouseEvent): void {
    const existe = this.horaEnFranja(dia, hora, this.ultimasFranjasSeleccionadas);
    if (this.seleccionando && event.buttons === 1 && !existe && this.agregando) {
      this.alternarSeleccion(dia, hora);
    }
    else if (this.seleccionando && event.buttons === 1 && existe && !this.agregando) {
      this.alternarSeleccion(dia, hora);
    }
  }

  terminarSeleccion(): void {
    this.seleccionando = false;
  }

  alternarSeleccion(dia: Date, hora: string): void {
    if (!this.horaEnFranja(dia, hora)) {
      if (!this.franjasSeleccionadas[dia.getDate()]) {
        this.franjasSeleccionadas[dia.getDate()] = [];
      }
      this.franjasSeleccionadas[dia.getDate()].push(hora);
    } else {
      const index = this.franjasSeleccionadas[dia.getDate()].indexOf(hora);
      this.franjasSeleccionadas[dia.getDate()].splice(index, 1);
    }
  }

  confirmarSeleccion(): void {
    let franjasFormateadas: Date[] = [];
    for(let franja in this.franjasSeleccionadas) {
      for(let hora of this.franjasSeleccionadas[franja]){
        const dia : number = this.diasDeLaSemana.findIndex((dia) => dia.getDate() === parseInt(franja))
        franjasFormateadas.push(
          this.citasService.diaHora(this.diasDeLaSemana[dia], hora)
        );
      }
    }
    // console.log(franjasFormateadas)
    this.citasService.subirCitas(this.idBarbero, franjasFormateadas).subscribe(
      () => {
        this.franjasSeleccionadas = [];
        this.recargarFechasSubidas();
      },
      () => {
        alert('No se han podido subir las citas');
      }
    );
  }

  cancelarSeleccion(): void {
    this.franjasSeleccionadas = [];
  }

}