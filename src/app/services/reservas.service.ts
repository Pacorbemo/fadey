import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReservasService {
  private apiUrl = 'http://localhost:5000/confirmar-reserva';

  constructor(private http: HttpClient) {}

  confirmarReserva(idBarbero:number, idCliente:number, dia: string, hora: string): Observable<any> {
    const body = { idBarbero, idCliente, dia, hora };
    return this.http.post(this.apiUrl, body);
  }
}
