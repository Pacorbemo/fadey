import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environments';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SocketIoModule } from 'ngx-socket-io';

import { cargandoInterceptor } from './interceptors/cargando.interceptor';
import { rutaInterceptor } from './interceptors/ruta.interceptor';

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
