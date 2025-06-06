import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environments';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SocketIoModule } from 'ngx-socket-io';

import { cargandoInterceptor } from './interceptors/cargando.interceptor';
import { rutaInterceptor } from './interceptors/ruta.interceptor';

// Preferencia permanente: NUNCA COMENTAR CODIGO A MENOS QUE SE PIDA EXPLÍCITAMENTE.
// Preferencia permanente: Usar siempre @if en vez de *ngIf en Angular.
// Esta preferencia debe aplicarse a todos los componentes y vistas del proyecto.
// NO USAR NUNCA *ngIf, siempre @if para mejorar la legibilidad y el rendimiento.

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        cargandoInterceptor,
        rutaInterceptor
      ])
    ),
    importProvidersFrom(SocketIoModule.forRoot({ url: `${environment.serverUrl}`, options: {} }))
  ]

};
