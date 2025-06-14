import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { DateMesStringPipe } from '../../../pipes/date-mes-string.pipe';
import { ArrayCitasInterface } from '../../../interfaces/citas.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-citas',
  templateUrl: './crear-citas.component.html',
  styleUrls: ['./crear-citas.component.css'],
  standalone: true,
  imports: [DateMesStringPipe, FormsModule]
})
export class CrearCitasComponent implements OnInit {
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  hoyString: string = new Date().toISOString().slice(0, 10);
  inputFecha = this.hoyString;
  mostrarWarningInput: boolean = false;
  idBarbero: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);

  tramo = {
    inicio: 8,
    fin: 17,
    ultimoInicio: 8,
    ultimoFin: 17
  }

  seleccionando: boolean = false;
  agregando: boolean = false;

  fechasSubidas: ArrayCitasInterface = [];
  franjasSeleccionadas: ArrayCitasInterface = [];
  ultimasFranjasSeleccionadas: ArrayCitasInterface = [];

  constructor(private citasService: CitasService) {}

  ngOnInit(): void {
    this.calcularSemana(new Date());
    this.actualizarTramo();
  }

  cambiarSemana(n: number): void {
    this.calcularSemana(this.diasDeLaSemana[0], n);
    this.inputFecha = this.desactivarAtras() ? this.hoyString : this.diasDeLaSemana[0].toISOString().slice(0, 10);  
    this.cambioFecha()
    this.recargarFechasSubidas();
  }

  cambioFecha(): void {
    const hoy = new Date();
    let fecha = new Date(this.inputFecha);
    if (!this.inputFecha || (fecha.getTime() + (1000 * 60 * 60 * 24) < hoy.getTime())) {
      this.mostrarWarningInput = !!this.inputFecha;
      this.inputFecha = hoy.toISOString().slice(0, 10);
      fecha = new Date(this.inputFecha)
    }else{
      this.mostrarWarningInput = false;
    }
    this.calcularSemana(fecha);
  }

  calcularSemana(fecha: Date, n: number = 0): void{
    this.diasDeLaSemana = this.citasService.calcularSemana(fecha, n);
    this.recargarFechasSubidas();
  }

  desactivarAtras(): boolean {
    return this.diasDeLaSemana[0].getTime() <= new Date().getTime();
  }

  recargarFechasSubidas(): void {
    this.citasService.getCitas(this.idBarbero, this.diasDeLaSemana[0]).subscribe({
      next: (fechas) => {
        this.fechasSubidas = fechas.totales;
      }
    });
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
    this.citasService.subirCitas(this.idBarbero, franjasFormateadas).subscribe({
      next: () => {
        this.franjasSeleccionadas = [];
        this.recargarFechasSubidas();
      },
      error: () => {
        alert('No se han podido subir las citas');
      }
    });
  }

  cancelarSeleccion(): void {
    this.franjasSeleccionadas = [];
  }

  actualizarTramo(): void {
    if( this.tramo.inicio >= this.tramo.fin || this.tramo.inicio < 0 || this.tramo.fin > 24) {
      this.tramo.inicio = this.tramo.ultimoInicio;
      this.tramo.fin = this.tramo.ultimoFin;
      return;
    }
    this.tramo.ultimoInicio = this.tramo.inicio;
    this.tramo.ultimoFin = this.tramo.fin;

    this.franjasHorarias = this.citasService.generarFranjasHorarias([this.tramo.inicio + ':00', this.tramo.fin - 1 + ':30']);
    this.franjasSeleccionadas = [];
    this.ultimasFranjasSeleccionadas = [];
  }
}