import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../services/citas.service';
import { DateMesStringPipe } from '../../pipes/date-mes-string.pipe';

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

  fechasSubidas: { dia: Date; hora: string }[] = [];
  franjasSeleccionadas: { dia: Date; hora: string }[] = [];
  ultimasFranjasSeleccionadas: { dia: Date; hora: string }[] = [];

  constructor(private citasService: CitasService) {}

  async ngOnInit(): Promise<void> {
    this.diasDeLaSemana = this.citasService.calcularSemana(new Date(), 0);
    this.recargarFechasSubidas();    
    this.franjasHorarias = this.citasService.generarFranjasHorarias();
  }

  recargarFechasSubidas(): void {
    this.citasService.getCitas(this.idBarbero, this.diasDeLaSemana[0]).then((fechas) => {
      this.fechasSubidas = fechas;
    });
  }

  async cambiarSemana(n: number) {
    this.diasDeLaSemana = this.citasService.calcularSemana(this.diasDeLaSemana[0], n);
    this.recargarFechasSubidas();
  }

  horaEnFranja(dia: Date, hora: string, franja : { dia: Date; hora: string }[] = this.franjasSeleccionadas): boolean {
    const index = franja.findIndex(
      (f) => f.dia.getDate() === dia.getDate() && f.hora === hora
    );
    return index !== -1;
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
    const index = this.franjasSeleccionadas.findIndex(
      (f) => f.dia.getTime() === dia.getTime() && f.hora === hora
    );
    if (index === -1) {
      this.franjasSeleccionadas.push({ dia, hora });
    } else {
      this.franjasSeleccionadas.splice(index, 1);
    }
  }

  confirmarSeleccion(): void {
    const franjasFormateadas : Date[] = this.franjasSeleccionadas.map((franja) => {
      const [horas, minutos] = franja.hora.split(':').map(Number);
      return new Date(
        Date.UTC(                       // Cambiamos el UTC por el local para que no haya problemas al guardar en la base de datos 
        franja.dia.getFullYear(),
        franja.dia.getMonth(),
        franja.dia.getDate(),
        horas,
        minutos,
        )
      );
    });
    this.citasService.subirCitas(this.idBarbero, franjasFormateadas).subscribe(
      (response) => {
        // console.log('Citas confirmadas:', response); 
        this.franjasSeleccionadas = [];
        this.recargarFechasSubidas();
      }
    );
  }

  cancelarSeleccion(): void {
    this.franjasSeleccionadas = [];
  }

}