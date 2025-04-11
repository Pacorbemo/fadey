import { Component, OnInit, ɵsetClassDebugInfo } from '@angular/core';
import { ReservasService } from '../../services/reservas.service';
import { CitasService } from '../../services/citas.service';
import { DateMesStringPipe } from '../../pipes/date-mes-string.pipe';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RelacionesService } from '../../services/relaciones.service';
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
  usuarioAutorizado: boolean = false;
  relacion : string = '';
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  idUsuario: number = parseInt(JSON.parse(localStorage.getItem('user') || '{}').id || '0', 10);
  idBarbero: number = 0;
  usernameBarbero: string = '';
  esBarbero: boolean = true;
  // horariosDisponibles: { [dia: number]: string[] } = {
  //   1: ['08:00', '08:30', '09:00', '10:00'],
  horariosDisponibles: {[dia: number]: string[]} = []
  horariosReservados: {[dia: number]: string[]} = []
  horariosReservadosPorUsuario: {[dia: number]: string[]} = []
  mostrarDialogo: boolean = false;
  diaSeleccionado: Date = new Date();
  
  constructor(
    private reservasService: ReservasService, 
    private citasService: CitasService,
    private usuariosService: UsuariosService,
    public relacionesService: RelacionesService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.route.params.subscribe(params => {
      this.usernameBarbero = params['username'];
    })
    await new Promise<void>((resolve) => {
      this.usuariosService.verificarUsername(this.usernameBarbero).subscribe((response) => {
      this.usernameValido = response.exists;
      if (response.exists && response.idBarbero) {
        this.idBarbero = response.idBarbero;
      }
      resolve();
      });
    });
    if(this.usernameValido){
      if (this.idBarbero == this.idUsuario) this.usuarioAutorizado = true;
      else{
        await this.relacionesService.comprobarRelacion(this.idBarbero).then((response) => {
          this.usuarioAutorizado = response.relacion == 'aceptado';
        });
      }
      this.esBarbero = await this.usuariosService.esBarbero(this.idBarbero);
      if(this.usuarioAutorizado){
        this.calcularSemana();
        await this.recargarCitas();
        this.generarFranjasHorarias();  
      }
      this.relacion = (await this.relacionesService.comprobarRelacion(this.idBarbero)).relacion
    }
    this.cargando = false;
  }
  
  semanaActual = {
    inicio: new Date(),
    fin: new Date()
  };

  desactivarAtras(): boolean {
    return this.semanaActual.inicio.getTime() <= this.citasService.dateAUTC(new Date()).getTime();
  }
  
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
    const response = await this.citasService.getCitas(this.idBarbero, this.semanaActual.inicio);
    this.horariosReservados = response.reservadas;
    this.horariosDisponibles = this.citasService.purgarDiasPasados(response.totales);
    this.horariosReservadosPorUsuario = response.reservadasUsuario;
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
    // console.log(this.citasService.diaHora(dia, hora).getHours())
    if (this.citasService.diaHora(dia, hora).getTime() < new Date().getTime()) return false;
    return this.horariosDisponibles[dia.getDate()]?.includes(hora) || false;
  }

  esFranjaReservada(dia: number, hora: string): number {
    if (this.horariosReservadosPorUsuario[dia]?.includes(hora))  return 2;
    if (this.horariosReservados[dia]?.includes(hora)) return 1;
    return 0;
  }

  mostrarReserva(dia: Date, hora: string): void {
    this.diaSeleccionado = this.citasService.diaHora(dia, hora);
    this.mostrarDialogo = true;
  }

  confirmarReserva(): void {
    this.reservasService.confirmarReserva(this.idBarbero, this.diaSeleccionado).subscribe(
      (response) => {
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
