import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { CargandoService } from '../services/cargando.service'; 
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

export interface Relacion {
  id: number;
  username: string;
  nombre: string;
  estado: string;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class RelacionesService {
  constructor(
    private httpService: HttpService,
    public cargandoService: CargandoService 
  ) {}

  getRelaciones(filtro?: string): Observable<Relacion[]> {
    return this.httpService.getToken('/relaciones').pipe(
      map((response: Relacion[]) => {
        if (filtro) {
          response = response.filter(
            (relacion: Relacion) => relacion.estado === filtro
          );
        }
        return response;
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesCliente(): Observable<Relacion[]> {
    return this.httpService.getToken('/relaciones/cliente').pipe(
      map((response: Relacion[]) => {
        return response.filter(
          (relacion: Relacion) => relacion.estado === 'aceptado'
        );
      }),
      finalize(() => this.cargandoService.ocultarCargando())
    );
  }

  getRelacionesBarbero(): Observable<Relacion[]> {
    return this.httpService.getToken('/relaciones/barbero').pipe(
      map((response: Relacion[]) => {
        return response.filter(
          (relacion: Relacion) => relacion.estado === 'aceptado'
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
