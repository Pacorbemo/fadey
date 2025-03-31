import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReservasService {
  private apiUrl = 'http://localhost:5000/confirmar-reserva';

  constructor(private http: HttpClient) {}

  confirmarReserva(idBarbero:number, dia: Date): Observable<any> {
    const token = localStorage.getItem('token');

    // console.log(dia);
    const body = { idBarbero, dia };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.apiUrl, body, { headers });
  }
}
