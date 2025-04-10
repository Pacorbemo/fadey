import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatosService } from './datos.service';

@Injectable({
  providedIn: 'root'
})
export class RelacionesService {
  constructor(private http: HttpClient, private datosService: DatosService) {}

  getRelaciones(filtro?: string): Promise<any> {
    const token = this.datosService.tokenUsuario;
    return new Promise<any>((resolve, reject) => {
      this.http.get('/relaciones', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).subscribe(
        (response) => {
          if (filtro) {
            response = JSON.parse(JSON.stringify(response)).filter((solicitud: any) => solicitud.estado === filtro);
          }
          resolve(response)
        },
        (error) => reject(error)
      );
    })
  }

  getSolicitudes():Promise<any> {
    return this.getRelaciones('pendiente')
  }

  solicitar(userBarbero:string): Promise<any> {
    const token = this.datosService.tokenUsuario;
    return new Promise<any>((resolve, reject) => {
      this.http.post('/solicitar', { userBarbero }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).subscribe(
        (response) => resolve(!!response),
        (error) => reject(error)
      );
    })
  }

  aceptarSolicitud(idRelacion: number): Promise<any> {
    const token = this.datosService.tokenUsuario;
    return new Promise<any>((resolve, reject) => {
      this.http.post('/aceptar-solicitud', { idRelacion }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).subscribe(
        (response) => resolve(response),
        (error) => reject(error)
      );
    })
  }

  rechazarSolicitud(idRelacion: number): Promise<any> {
    const token = this.datosService.tokenUsuario;
    return new Promise<any>((resolve, reject) => {
      this.http.post('/rechazar-solicitud', { idRelacion }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).subscribe(
        (response) => resolve(response),
        (error) => reject(error)
      );
    })
  }

  eliminarRelacion(idRelacion: number): Promise<any> {
    const token = this.datosService.tokenUsuario;
    return new Promise<any>((resolve, reject) => {
      this.http.post('/eliminar-relacion', { idRelacion }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).subscribe(
        (response) => resolve(response),
        (error) => reject(error)
      );
    })
  }

  comprobarRelacion(idBarbero:number): Promise<{relacion: string}> {
    const token = this.datosService.tokenUsuario;
    return new Promise<{ relacion: string }>((resolve, reject) => {
      this.http.get<{ relacion: string }>('/comprobar-relacion', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          idBarbero
        }
      }).subscribe(
        (response) => {
          resolve(response);
        },
        (error) => reject(error)
      );
    })
  }
}
