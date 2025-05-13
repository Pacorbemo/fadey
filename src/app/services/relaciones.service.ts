import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class RelacionesService {
  constructor(private httpService: HttpService) {}

  getRelaciones(filtro?: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpGetToken('/relaciones')
        .subscribe(
          (response) => {
            if (filtro) {
              response = JSON.parse(JSON.stringify(response)).filter((solicitud: any) => solicitud.estado === filtro);
            }
            resolve(response);
          },
          (error) => reject(error)
        );
    });
  }

  getRelacionesCliente(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpGetToken('/relaciones/cliente')
        .subscribe(
          (response) => {
            response = JSON.parse(JSON.stringify(response)).filter((solicitud: any) => solicitud.estado === 'aceptado');
            resolve(response);
          },
          (error) => reject(error)
        );
    });
  }

  getRelacionesBarbero(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpGetToken('/relaciones/barbero')
        .subscribe(
          (response) => {
            response = JSON.parse(JSON.stringify(response)).filter((solicitud: any) => solicitud.estado === 'aceptado');
            resolve(response);
          },
          (error) => reject(error)
        );
    });
  }

  getSolicitudes(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpGetToken('/relaciones/solicitudes')
        .subscribe(
          (response) => {
            resolve(response);
          },
          (error) => reject(error)
        );
    });
  }

  solicitar(userBarbero: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpPostToken('/relaciones/solicitar', { userBarbero })
        .subscribe(
          (response) => resolve(!!response),
          (error) => reject(error)
        );
    });
  }

  aceptarSolicitud(idRelacion: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpPostToken('/relaciones/aceptar', { idRelacion })
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
    });
  }

  rechazarSolicitud(idRelacion: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpPostToken('/relaciones/rechazar', { idRelacion })
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
    });
  }

  eliminarRelacion(idRelacion: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.httpService.httpPostToken('/relaciones/eliminar', { idRelacion })
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
    });
  }

  comprobarRelacion(idBarbero: number): Promise<{ relacion: string }> {
    return new Promise<{ relacion: string }>((resolve, reject) => {
      this.httpService.httpGetToken('/relaciones/comprobar', { idBarbero: idBarbero.toString() })
        .subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
    });
  }
}
