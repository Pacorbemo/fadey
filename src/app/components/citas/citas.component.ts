import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  franjasHorarias: string[] = [];
  horariosDisponibles: { [dia: string]: string[] } = {
      Lunes: ['08:00', '08:30', '09:00', '10:00'],
      Martes: ['10:00', '10:30', '11:00', '12:00'],
      Miércoles: ['08:00', '09:00', '10:00', '11:00'],
      Jueves: ['14:00', '14:30', '15:00', '15:30', '16:00'],
      Viernes: ['08:00', '08:30', '09:00', '10:00', '11:00'],
      Sábado: [],
      Domingo: []
  };
  mostrarDialogo: boolean = false;
  diaSeleccionado: string = '';
  horaSeleccionada: string = '';

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.generarFranjasHorarias();
    // this.definirHorariosDisponibles();
  }

  generarFranjasHorarias(): void {
    const horasDisponibles = Object.values(this.horariosDisponibles).flat();
    const horaInicio = Math.min(...horasDisponibles.map(hora => parseInt(hora.split(':')[0])));
    const horaFin = Math.max(...horasDisponibles.map(hora => parseInt(hora.split(':')[0])));
    const minutosFin = Math.max(
      ...horasDisponibles
      .filter(hora => parseInt(hora.split(':')[0]) === horaFin)
      .map(hora => parseInt(hora.split(':')[1]))
    );
    const intervalo = 30;

    for (let hora = horaInicio; hora < horaFin + 1; hora++) {
      for (let minutos = 0; minutos < 60; minutos += intervalo) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        this.franjasHorarias.push(horaFormateada);
        if(hora === horaFin && minutos === minutosFin) break; // Nos ahorramos pintar el :30 si la última hora termina en :00
      }
    }
  }

  // definirHorariosDisponibles(): void {
  //   this.horariosDisponibles = 
  // }

  esFranjaDisponible(dia: string, hora: string): boolean {
    return this.horariosDisponibles[dia]?.includes(hora) || false;
  }

  mostrarReserva(dia: string, hora: string): void {
    this.diaSeleccionado = dia;
    this.horaSeleccionada = hora;
    this.mostrarDialogo = true;
  }

  confirmarReserva(): void {
    this.reservasService.confirmarReserva(1, 1,this.diaSeleccionado, this.horaSeleccionada).subscribe(
      response => {
        console.log('Reserva confirmada:', response);
        this.mostrarDialogo = false;
      },
      error => {
        console.error('Error al confirmar la reserva:', error);
      }
    );
  }

  cancelarReserva(): void {
    this.mostrarDialogo = false;
  }
}