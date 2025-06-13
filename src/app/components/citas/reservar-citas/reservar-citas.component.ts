import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { DateMesStringPipe } from '../../../pipes/date-mes-string.pipe';
import { UsuariosService } from '../../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RelacionesService } from '../../../services/relaciones.service';
import { CargandoService } from '../../../services/cargando.service';
import { ToastService } from '../../../services/toast.service';
@Component({
  selector: 'app-reservar-citas',
  templateUrl: './reservar-citas.component.html',
  styleUrls: ['./reservar-citas.component.css'],
  standalone: true,
  imports: [DateMesStringPipe, CommonModule, RouterLink]
})
export class ReservarCitasComponent implements OnInit {
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
    private citasService: CitasService,
    private usuariosService: UsuariosService,
    public relacionesService: RelacionesService,
    private route: ActivatedRoute,
    public cargandoService: CargandoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: params => {
        this.usernameBarbero = params['username'];
        this.usuariosService.datosUsername(this.usernameBarbero).subscribe({
          next: (response) => {
            this.usernameValido = response.exists;
            if (response.exists && response.user?.id) {
              this.idBarbero = response.user?.id;
            }
            if (this.usernameValido) {
              if (this.idBarbero == this.idUsuario) {
                this.usuarioAutorizado = true;
                this.esBarbero = true;
                this.calcularSemana();
                this.relacion = 'aceptado';
              } else {
                this.relacionesService.comprobarRelacion(this.idBarbero).subscribe({
                  next: (relacionResponse) => {
                    this.usuarioAutorizado = relacionResponse.relacion == 'aceptado';
                    this.relacion = relacionResponse.relacion;
                    this.usuariosService.esBarbero(this.idBarbero).subscribe({
                      next: (esBarbero) => {
                        this.esBarbero = esBarbero;
                        if (this.usuarioAutorizado && this.esBarbero) {
                          this.calcularSemana();
                        }
                      }
                    });
                  }
                });
              }
            }
          }
        });
      }
    });
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
    this.recargarCitas();
  }

  cambiarSemana(n: number): void {
    this.calcularSemana(n);
  }

  getStringMes(mes: number): string {
    return new Date(2025, mes - 1).toLocaleString('default', { month: 'long' });
  }

  recargarCitas(): void {
    this.citasService.getCitas(this.idBarbero, this.semanaActual.inicio).subscribe({
      next: (response) => {
        this.horariosReservados = response.reservadas;
        this.horariosDisponibles = this.citasService.purgarDiasPasados(response.totales, this.semanaActual.inicio);
        this.horariosReservadosPorUsuario = response.reservadasUsuario;
        this.generarFranjasHorarias();
      }
    });
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
    this.citasService.confirmarReserva(this.idBarbero, this.diaSeleccionado).subscribe({
      next: () => {
        this.mostrarDialogo = false;
        this.recargarCitas(); 
      },
      error: (error) => {
        this.toastService.error(error);
      }
    });
  }

  cancelarReserva(): void {
    this.mostrarDialogo = false;
  }

  solicitar(usernameBarbero: string): void {
    this.relacionesService.solicitar(usernameBarbero);
    this.relacion = 'pendiente';
  }
}
