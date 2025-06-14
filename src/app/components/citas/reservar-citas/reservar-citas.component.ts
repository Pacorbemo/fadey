import { Component, OnInit } from '@angular/core';
import { CitasService } from '../../../services/citas.service';
import { DateMesStringPipe } from '../../../pipes/date-mes-string.pipe';
import { UsuariosService } from '../../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RelacionesService } from '../../../services/relaciones.service';
import { ToastService } from '../../../services/toast.service';
import { DatosService } from '../../../services/datos.service';
@Component({
  selector: 'app-reservar-citas',
  templateUrl: './reservar-citas.component.html',
  styleUrls: ['./reservar-citas.component.css'],
  standalone: true,
  imports: [DateMesStringPipe, CommonModule, RouterLink],
})
export class ReservarCitasComponent implements OnInit {
  usuario = {
    id: this.datosService.user.id,
    autorizado: false
  };
  barbero = {
    id: 0,
    username: '',
    esBarbero: false
  };
  horarios = {
    disponibles: {} as { [dia: number]: string[] },
    reservados: {} as { [dia: number]: string[] },
    reservadosPorUsuario: {} as { [dia: number]: string[] }
  };
  cargando = {
    local: true,
    citas: true
  };
  relacion: string = '';
  diasDeLaSemana: Date[] = [];
  franjasHorarias: string[] = [];
  diaSeleccionado: Date = new Date();
  
  mostrarDialogo: boolean = false;
  usernameValido: boolean = false;

  constructor(
    private citasService: CitasService,
    private usuariosService: UsuariosService,
    public relacionesService: RelacionesService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private datosService: DatosService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        this.barbero.username = params['username'];
        this.usuariosService.datosUsername(this.barbero.username).subscribe({
          next: (response) => {
            this.usernameValido = response.exists;
            if (response.exists && response.user?.id) {
              this.barbero.id = response.user?.id;
            }
            if (this.usernameValido) {
              if (this.barbero.id == this.usuario.id) {
                this.usuario.autorizado = true;
                this.barbero.esBarbero = true;
                this.calcularSemana();
                this.relacion = 'aceptado';
                this.cargando.local = false;
              } else {
                this.relacionesService
                  .comprobarRelacion(this.barbero.id)
                  .subscribe({
                    next: (relacionResponse) => {
                      this.usuario.autorizado =
                        relacionResponse.relacion == 'aceptado';
                      this.relacion = relacionResponse.relacion;
                      this.usuariosService.esBarbero(this.barbero.id).subscribe({
                        next: (esBarbero) => {
                          this.barbero.esBarbero = esBarbero;
                          if (this.usuario.autorizado && this.barbero.esBarbero) {
                            this.calcularSemana();
                            this.cargando.local = false;
                          }
                        },
                      });
                    },
                  });
              }
            }
          },
        });
      },
    });
  }

  semanaActual = {
    inicio: new Date(),
    fin: new Date(),
  };

  desactivarAtras(): boolean {
    return (
      this.semanaActual.inicio.getTime() <=
      this.citasService.dateAUTC(new Date()).getTime()
    );
  }

  calcularSemana(n: number = 0): void {
    this.cargando.citas = true;
    this.diasDeLaSemana = this.citasService.calcularSemana(
      this.semanaActual.inicio,
      n
    );
    this.semanaActual.inicio = this.diasDeLaSemana[0];
    this.semanaActual.fin = this.diasDeLaSemana[6];
    this.recargarCitas();
    this.cargando.citas = false;
  }

  cambiarSemana(n: number): void {
    this.calcularSemana(n);
  }

  getStringMes(mes: number): string {
    return new Date(2025, mes - 1).toLocaleString('default', { month: 'long' });
  }

  recargarCitas(): void {
    this.citasService
      .getCitas(this.barbero.id, this.semanaActual.inicio)
      .subscribe({
        next: (response) => {
          this.horarios.reservados = response.reservadas;
          this.horarios.disponibles = this.citasService.purgarDiasPasados(
            response.totales,
          );
          this.horarios.reservadosPorUsuario = response.reservadasUsuario;
          this.generarFranjasHorarias();
        },
      });
  }

  generarFranjasHorarias(): void {
    const horasDisponibles = Object.values(this.horarios.disponibles).flat();
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
        if (hora === horaFin && minutos === minutosFin) break; // Ahorramos pintar el :30 si la última hora termina en :00
      }
    }
  }

  esFranjaDisponible(dia: Date, hora: string): boolean {
    if (this.citasService.diaHora(dia, hora).getTime() < new Date().getTime())
      return false;
    return this.horarios.disponibles[dia.getDate()]?.includes(hora) || false;
  }

  esFranjaReservada(dia: number, hora: string): number {
    if (this.horarios.reservadosPorUsuario[dia]?.includes(hora)) return 2;
    if (this.horarios.reservados[dia]?.includes(hora)) return 1;
    return 0;
  }

  mostrarReserva(dia: Date, hora: string): void {
    this.diaSeleccionado = this.citasService.diaHora(dia, hora);
    this.mostrarDialogo = true;
  }

  confirmarReserva(): void {
    this.citasService
      .confirmarReserva(this.barbero.id, this.diaSeleccionado)
      .subscribe({
        next: () => {
          this.mostrarDialogo = false;
          this.recargarCitas();
        },
        error: (error) => {
          this.toastService.error(error);
        },
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
