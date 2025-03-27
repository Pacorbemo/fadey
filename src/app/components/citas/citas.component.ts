import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  franjasHorarias: string[] = [];
  horariosDisponibles: { [dia: string]: string[] } = {};
  mostrarDialogo: boolean = false;
  diaSeleccionado: string = '';
  horaSeleccionada: string = '';

  ngOnInit(): void {
    this.generarFranjasHorarias();
    this.definirHorariosDisponibles();
  }

  generarFranjasHorarias(): void {
    const horaInicio = 8;
    const horaFin = 20;
    const intervalo = 30;

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minutos = 0; minutos < 60; minutos += intervalo) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        this.franjasHorarias.push(horaFormateada);
      }
    }
  }

  definirHorariosDisponibles(): void {
    this.horariosDisponibles = {
      Lunes: ['08:00', '08:30', '09:00', '10:00'],
      Martes: ['10:00', '10:30', '11:00', '12:00'],
      Miércoles: ['08:00', '09:00', '10:00', '11:00'],
      Jueves: ['14:00', '14:30', '15:00'],
      Viernes: ['08:00', '08:30', '09:00', '10:00', '11:00'],
      Sábado: [],
      Domingo: []
    };
  }

  esFranjaDisponible(dia: string, hora: string): boolean {
    return this.horariosDisponibles[dia]?.includes(hora) || false;
  }

  mostrarReserva(dia: string, hora: string): void {
    this.diaSeleccionado = dia;
    this.horaSeleccionada = hora;
    this.mostrarDialogo = true;
  }

  confirmarReserva(): void {
    console.log(`Reserva confirmada para ${this.diaSeleccionado} a las ${this.horaSeleccionada}`);
    this.mostrarDialogo = false;
  }

  cancelarReserva(): void {
    this.mostrarDialogo = false;
  }
}