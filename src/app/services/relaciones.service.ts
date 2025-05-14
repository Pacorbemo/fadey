import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { CargandoService } from '../services/cargando.service'; 
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RelacionesService {
  constructor(
    private httpService: HttpService,
    public cargandoService: CargandoService 
  ) {}

  getRelaciones(filtro?: string): Observable<any> {
    return this.httpService.httpGetToken('/relaciones').pipe(
      map((response: any) => {
        if (filtro) {
          response = JSON.parse(JSON.stringify(response)).filter(
            (solicitud: any) => solicitud.estado === filtro
          );
        }
        return response;
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesCliente(): Observable<any> {
    return this.httpService.httpGetToken('/relaciones/cliente').pipe(
      map((response: any) => {
        return JSON.parse(JSON.stringify(response)).filter(
          (solicitud: any) => solicitud.estado === 'aceptado'
        );
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesBarbero(): Observable<any> {
    return this.httpService.httpGetToken('/relaciones/barbero').pipe(
      map((response: any) => {
        return JSON.parse(JSON.stringify(response)).filter(
          (solicitud: any) => solicitud.estado === 'aceptado'
        );
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getSolicitudes(): Observable<any> {
    return this.httpService.httpGetToken('/relaciones/solicitudes').pipe(
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  solicitar(userBarbero: string): Observable<any> {
    return this.httpService
      .httpPostToken('/relaciones/solicitar', { userBarbero })
      .pipe(
        map((response: any) => !!response),
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  aceptarSolicitud(idRelacion: number): Observable<any> {
    return this.httpService
      .httpPostToken('/relaciones/aceptar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  rechazarSolicitud(idRelacion: number): Observable<any> {
    return this.httpService
      .httpPostToken('/relaciones/rechazar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  eliminarRelacion(idRelacion: number): Observable<any> {
    return this.httpService
      .httpPostToken('/relaciones/eliminar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  comprobarRelacion(idBarbero: number): Observable<{ relacion: string }> {
    return this.httpService
      .httpGetToken('/relaciones/comprobar', {
        idBarbero: idBarbero.toString(),
      })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }
}
