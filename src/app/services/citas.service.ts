import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GetCitasInterface,
  GetCitasResponseInterface,
} from '../interfaces/citas.interface';
import { HttpService } from './http.service';
import { map, finalize } from 'rxjs/operators';
import { CargandoService } from './cargando.service';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  constructor(
    private httpService: HttpService,
    private cargandoService: CargandoService
  ) {}

  dateAUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  }

  // Si le pasamos cualquier día de la semana, devuelve el lunes de esa semana
  primerDiaSemana(diaInicio: Date): Date {
    const copiaDiaInicio = new Date(diaInicio);
    const dia = copiaDiaInicio.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    copiaDiaInicio.setDate(copiaDiaInicio.getDate() + diff);
    return copiaDiaInicio;
  }

  // Transformar un dia en formato Date más una hora en string en un Date
  diaHora(dia: Date, hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date(dia);
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  // Array con los 7 días de la semana, sumando o restando tantas semanas como "n"
  calcularSemana(diaInicio: Date, n: number = 0): Date[] {
    const diasSemana = [];
    diaInicio.setUTCHours(0, 0, 0, 0);
    const primerDiaSemana = this.primerDiaSemana(
      this.sumarDias(diaInicio, n * 7)
    );
    for (let i = 0; i < 7; i++) {
      diasSemana.push(this.sumarDias(primerDiaSemana, i));
    }
    return diasSemana;
  }

  sumarDias(fecha: Date, dias: number): Date {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  }

  // Array con TODOS los tramos horarios entre la hora más temprana y la más tardía
  // Si no se le pasa un array de horas, devuelve de 00:00 a 23:30
  generarFranjasHorarias(horariosDisponibles?: string[]): string[] {
    let horaInicio: number;
    let horaFin: number;
    let minutosFin: number;
    const intervalo: number = 30;

    if (horariosDisponibles) {
      const horasDisponibles = Object.values(horariosDisponibles).flat();
      horaInicio = Math.min(
        ...horasDisponibles.map((hora) => parseInt(hora.split(':')[0]))
      );
      horaFin = Math.max(
        ...horasDisponibles.map((hora) => parseInt(hora.split(':')[0]))
      );
      minutosFin = Math.max(
        ...horasDisponibles
          .filter((hora) => parseInt(hora.split(':')[0]) === horaFin)
          .map((hora) => parseInt(hora.split(':')[1]))
      );
    } else {
      horaInicio = 0;
      horaFin = 23;
      minutosFin = 30;
    }

    let franjasHorarias: string[] = [];
    for (let hora = horaInicio; hora < horaFin + 1; hora++) {
      for (let minutos = 0; minutos < 60; minutos += intervalo) {
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minutos
          .toString()
          .padStart(2, '0')}`;
        franjasHorarias.push(horaFormateada);
        if (hora === horaFin && minutos === minutosFin) break; // Nos ahorramos pintar el :30 si la última hora termina en :00
      }
    }
    return franjasHorarias;
  }

  subirCitas(idBarbero: number, fechas: Date[]): Observable<any> {
    const body = { idBarbero, fechas };
    return this.httpService.postToken('/citas/crear', body);
  }

  // Obtener las citas de un BARBERO
  getCitas(
    idBarbero: number,
    inicio: Date
  ): Observable<GetCitasResponseInterface> {
    inicio = this.primerDiaSemana(inicio);
    const fin = this.sumarDias(inicio, 7);
    const body = {
      idBarbero,
      inicio,
      fin,
    };

    return this.httpService.postToken('/citas', body).pipe(
      map((response: any) => {
        return ['totales', 'reservadas', 'reservadasUsuario'].reduce(
          (acc, key) => {
            acc[key as keyof GetCitasResponseInterface] = this.procesarFechas(
              response[key as keyof GetCitasInterface]
            );
            return acc;
          },
          {} as GetCitasResponseInterface
        );
      }),
      finalize(() => {
        this.cargandoService.ocultarCargando();
      })
    );
  }

  getCitasBarbero(params: { limit?: number; offset?: number } = {}): Observable<any> {
    return this.httpService.getToken('/citas/barbero', params);
  }

  getCitasUsuario(params: { limit?: number; offset?: number } = {}): Observable<any> {
    return this.httpService.getToken('/citas/cliente', params);
  }

  purgarDiasPasados(
    horarios: { [dia: number]: string[] },
    primerDiaSemana: Date
  ): { [dia: number]: string[] } {
    const hoy = new Date();
    const horariosPurgados: { [dia: number]: string[] } = {};

    Object.entries(horarios).forEach(([diaStr, horas]) => {
      const dia = parseInt(diaStr);
      if (dia === hoy.getDate()) {
        horariosPurgados[dia] = horas.filter(
          (hora) =>
            hora >
            `${hoy.getHours().toString().padStart(2, '0')}:${hoy
              .getMinutes()
              .toString()
              .padStart(2, '0')}`
        );
      } else if (dia > hoy.getDate() || dia < hoy.getDate() - 7) {
        // La segunda condicion añade los días de inicio de mes, en las semanas que contienen dias de dos meses (30,31,1,2...)
        horariosPurgados[dia] = horas;
      }
    });

    return horariosPurgados;
  }

  // Transformar un array de Date a un objeto con claves numero de día y valores los horarios
  // { 1: ['08:00', '08:30'], 2: ['09:00', '09:30'], ... }
  private procesarFechas(fechas: Date[]): { [dia: number]: string[] } {
    const resultado: { [dia: number]: string[] } = {};
    fechas.forEach((fecha: Date) => {
      const parsedFecha = new Date(fecha);
      const dia = parsedFecha.getDate();
      if (!resultado[dia]) {
        resultado[dia] = [];
      }
      resultado[dia].push(
        `${parsedFecha.getHours().toString().padStart(2, '0')}:${parsedFecha
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    });
    return resultado;
  }

  confirmarReserva(idBarbero: number, dia: Date): Observable<any> {
    const body = { idBarbero, dia };
    return this.httpService.postToken('/citas/confirmar', body);
  }

  generarCitasSemana(inicio: Date, fin: Date): Observable<any> {
    return this.httpService.postToken('/citas/generar-semana', { inicio, fin });
  }
}
