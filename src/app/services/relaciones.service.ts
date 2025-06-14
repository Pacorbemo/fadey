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
    return this.httpService.getToken('/relaciones').pipe(
      map((response: any) => {
        if (filtro) {
          response = response.filter(
            (solicitud: any) => solicitud.estado === filtro
          );
        }
        return response;
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesCliente(): Observable<any> {
    return this.httpService.getToken('/relaciones/cliente').pipe(
      map((response: any) => {
        return response.filter(
          (solicitud: any) => solicitud.estado === 'aceptado'
        );
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesBarbero(): Observable<any> {
    return this.httpService.getToken('/relaciones/barbero').pipe(
      map((response: any) => {
        return response.filter(
          (solicitud: any) => solicitud.estado === 'aceptado'
        );
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getSolicitudes(): Observable<any> {
    return this.httpService.getToken('/relaciones/solicitudes').pipe(
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  solicitar(userBarbero: string): Observable<any> {
    return this.httpService
      .postToken('/relaciones/solicitar', { userBarbero })
      .pipe(
        map((response: any) => !!response),
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  aceptarSolicitud(idRelacion: number): Observable<any> {
    return this.httpService
      .postToken('/relaciones/aceptar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  rechazarSolicitud(idRelacion: number): Observable<any> {
    return this.httpService
      .postToken('/relaciones/rechazar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  eliminarRelacion(idRelacion: number): Observable<any> {
    return this.httpService
      .postToken('/relaciones/eliminar', { idRelacion })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }

  comprobarRelacion(idBarbero: number): Observable<{ relacion: string }> {
    return this.httpService
      .getToken('/relaciones/comprobar', {
        idBarbero: idBarbero.toString(),
      })
      .pipe(
        finalize(() => this.cargandoService.ocultarCargando())
      );
  }
}
