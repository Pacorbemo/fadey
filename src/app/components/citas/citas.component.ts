import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas.service';
import { CitasService } from '../../services/citas.service';
import { createSignal } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit {
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  idBarbero: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  // horariosDisponibles: { [dia: number]: string[] } = {
  //   1: ['08:00', '08:30', '09:00', '10:00'],
  //   2: ['10:00', '10:30', '11:00', '12:00'],
  //   3: ['08:00', '09:00', '10:00', '11:00'],
  //   4: ['14:00', '14:30', '15:00', '15:30', '16:00'],
  //   5: ['08:00', '08:30', '09:00', '10:00', '11:00'],
  //   6: [],
  //   7: [],
  // };
  horariosDisponibles: {[dia: number]: string[]} = []
  horariosReservados: {[dia: number]: string[]} = []
  mostrarDialogo: boolean = false;
  diaSeleccionado: Date = new Date();

  semanaActual = {
    inicio: new Date(),
    fin: new Date()
  };

  calcularSemana(n: number = 0): void {
    this.diasDeLaSemana = this.citasService.calcularSemana(this.semanaActual.inicio, n);
    this.semanaActual.inicio = this.diasDeLaSemana[0];
    this.semanaActual.fin = this.diasDeLaSemana[6];
  }

  async cambiarSemana(n: number) {
    this.calcularSemana(n);
    await this.recargarCitas();
  }

  getStringMes(mes: number): string {
    return new Date(2025, mes - 1).toLocaleString('default', { month: 'long' });
  }

  constructor(private reservasService: ReservasService, private citasService: CitasService) {}

  async ngOnInit(): Promise<void> {
    this.calcularSemana();
    await this.recargarCitas();
    this.generarFranjasHorarias();  
  }

  async recargarCitas(){
    const response = await this.citasService.getCitas2(this.idBarbero, this.semanaActual.inicio);
    this.horariosReservados = response.reservadas;
    this.horariosDisponibles = response.totales;
  }

  generarFranjasHorarias(): void {
    const horasDisponibles = Object.values(this.horariosDisponibles).flat();
    const horaInicio = Math.min(
      ...horasDisponibles.map((hora) => parseInt(hora.split(':')[0]))
    );
    const horaFin = Math.max(
      ...horasDisponibles.map((hora) => parseInt(hora.split(':')[0]))
    );
    const minutosFin = Math.max(
      ...horasDisponibles
        .filter((hora) => parseInt(hora.split(':')[0]) === horaFin)
        .map((hora) => parseInt(hora.split(':')[1]))
    );
    const intervalo = 30;

    for (let hora = horaInicio; hora < horaFin + 1; hora++) {
      for (let minutos = 0; minutos < 60; minutos += intervalo) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minutos
          .toString()
          .padStart(2, '0')}`;
        this.franjasHorarias.push(horaFormateada);
        if (hora === horaFin && minutos === minutosFin) break; // Nos ahorramos pintar el :30 si la última hora termina en :00
      }
    }
  }

  esFranjaDisponible(dia: number, hora: string): boolean {
    return this.horariosDisponibles[dia]?.includes(hora) || false;
  }

  esFranjaReservada(dia: number, hora: string): boolean {
    return this.horariosReservados[dia]?.includes(hora) || false;
  }

  mostrarReserva(dia: Date, hora: string): void {
    const [horas, minutos] = hora.split(':').map(Number);
    this.diaSeleccionado = new Date(
      Date.UTC(                       // Cambiamos el UTC por el local para que no haya problemas al guardar en la base de datos 
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      horas,
      minutos,
      )
    );
    this.mostrarDialogo = true;
  }

  confirmarReserva(): void {
    this.reservasService.confirmarReserva(this.idBarbero, this.diaSeleccionado).subscribe(
      (response) => {
        console.log('Reserva confirmada:', response);
        this.mostrarDialogo = false;
      },
      (error) => {
        console.error('Error al confirmar la reserva:', error);
      }
    );
  }

  cancelarReserva(): void {
    this.mostrarDialogo = false;
  }
}
