import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  constructor(private http: HttpClient) {}

  calcularSemana(diaInicio: Date, n: number = 0): Date[] {
    const hoy = diaInicio;
    const diasSemana = [];
    const primerDiaSemana = new Date(
      hoy.setDate(hoy.getDate() - hoy.getDay() + 1 + n * 7)
    );
    const ultimoDiaSemana = new Date(primerDiaSemana);
    ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);

    diaInicio = primerDiaSemana;
    for (let i = 0; i < 7; i++) {
      diasSemana.push(this.sumarDias(diaInicio, i));
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
    const intervalo: number = 30

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
    }
    else  {
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
    const apiUrl = 'http://localhost:5000/crear-citas';
    const token = localStorage.getItem('token');
    const body = { idBarbero, fechas };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(apiUrl, body, { headers });
  }
}
