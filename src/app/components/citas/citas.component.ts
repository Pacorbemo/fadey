import { Component, OnInit } from '@angular/core';
import { ReservasService } from '../../services/reservas.service';
import { CitasService } from '../../services/citas.service';
import { DateMesStringPipe } from '../../pipes/date-mes-string.pipe';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css'],
  standalone: true,
  imports: [DateMesStringPipe, CommonModule, RouterLink]
})
export class CitasComponent implements OnInit {
  cargando: boolean = true;
  usernameValido: boolean = false;
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  idUsuario: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  idBarbero: number = 11;
  usernameBarbero: string = '';
  // usernameBarbero$! :  Observable<{username: string, nombre: string}>;
  // horariosDisponibles: { [dia: number]: string[] } = {
  //   1: ['08:00', '08:30', '09:00', '10:00'],
  horariosDisponibles: {[dia: number]: string[]} = []
  horariosReservados: {[dia: number]: string[]} = []
  mostrarDialogo: boolean = false;
  diaSeleccionado: Date = new Date();
  
  constructor(
    private reservasService: ReservasService, 
    private citasService: CitasService,
    private usuariosService: UsuariosService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    // this.usernameBarbero$ = this.usuariosService.getUserById(this.idBarbero);
    this.route.params.subscribe(params => {
      this.usernameBarbero = params['username'];
    })
    this.usuariosService.verificarUsername(this.usernameBarbero).subscribe((response) => this.usernameValido = response.exists);
    this.calcularSemana();
    await this.recargarCitas();
    this.generarFranjasHorarias();  
    this.cargando = false;
  }
  
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
    this.generarFranjasHorarias();
  }

  getStringMes(mes: number): string {
    return new Date(2025, mes - 1).toLocaleString('default', { month: 'long' });
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

    this.franjasHorarias = [];
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

  esFranjaDisponible(dia: Date, hora: string): boolean {
    if (this.citasService.diaHora(dia, hora).getTime() < new Date().getTime() - new Date().getTimezoneOffset() * 60000) return false;
    return this.horariosDisponibles[dia.getDate()]?.includes(hora) || false;
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
        this.recargarCitas(); 
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
