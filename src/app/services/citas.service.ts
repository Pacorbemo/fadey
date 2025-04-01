import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  apiUrl = 'http://localhost:5000/';

  constructor(private http: HttpClient) {}

  primerDiaSemana(diaInicio: Date): Date {
    diaInicio.setDate(diaInicio.getDate() - diaInicio.getDay() + 1);
    return diaInicio;
  }

  calcularSemana(diaInicio: Date, n: number = 0): Date[] {
    const diasSemana = [];
    const primerDiaSemana = this.primerDiaSemana(this.sumarDias(diaInicio, n * 7));

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
    const token = localStorage.getItem('token');
    const body = { idBarbero, fechas };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}crear-citas`, body, { headers });
  }

  async getCitas(idBarbero: number, inicio: Date): Promise<{ dia: Date; hora: string }[]> {
    const token = localStorage.getItem('token');
    inicio = this.primerDiaSemana(inicio);
    inicio.setUTCHours(0, 0, 0, 0);
    const fin = this.sumarDias(inicio, 7);
    console.log(inicio, fin)
    const body = {
      idBarbero,
      inicio,
      fin,
    };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let fechas : { dia: Date; hora: string }[] = [];
    return new Promise<{ dia: Date; hora: string }[]>((resolve, reject) => {
      this.http.post<{todos: Date[]; reservados: Date[]}>(`${this.apiUrl}citas`, body, { headers }).subscribe(
      (response) => {
        console.log(response)
        fechas = response.todos.map((fecha: Date) => {
        const parsedFecha = new Date(fecha);
        return {
          dia: parsedFecha,
          hora: `${parsedFecha.getHours().toString().padStart(2, '0')}:${parsedFecha.getMinutes().toString().padStart(2, '0')}`,
        };
        });
        resolve(fechas);
      },
      (error) => {
        reject(error);
      }
      );
    });
  }

  async getCitas2(idBarbero: number, inicio: Date): Promise<{ totales: { [dia: number]: string[] }; reservadas: { [dia: number]: string[] } }> {
    const token = localStorage.getItem('token');
    inicio = this.primerDiaSemana(inicio);
    const fin = this.sumarDias(inicio, 7);
    const body = {
      idBarbero,
      inicio,
      fin,
    };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return new Promise<{ totales: { [dia: number]: string[] }; reservadas: { [dia: number]: string[] } }>((resolve, reject) => {
      this.http.post<{todos: Date[]; reservados: Date[]}>(`${this.apiUrl}citas`, body, { headers }).subscribe(
        (response) => {
        let totales : { [dia: number]: string[] } = [];
        let reservadas : { [dia: number]: string[] } = [];
        response.todos.forEach((fecha: Date) => {
          const parsedFecha = new Date(fecha);
          const dia = parsedFecha.getDate();
          if (!totales[dia]) {
            totales[dia] = [];
          }
          totales[dia].push(`${parsedFecha.getHours().toString().padStart(2, '0')}:${parsedFecha.getMinutes().toString().padStart(2, '0')}`);
        });
        response.reservados.forEach((fecha: Date) => {
          const parsedFecha = new Date(fecha);
          const dia = parsedFecha.getDate();
          if (!reservadas[dia]) {
            reservadas[dia] = [];
          }
          reservadas[dia].push(`${parsedFecha.getHours().toString().padStart(2, '0')}:${parsedFecha.getMinutes().toString().padStart(2, '0')}`);
        });
        resolve({ totales, reservadas });
      },
      (error) => {
        reject(error);
      }
      );
    });
  }
}
