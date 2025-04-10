import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from './environments/environments';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const apiReq = req.clone({ url: `${environment.serverUrl}${req.url}` });
          return next(apiReq);
        },
      ])
    ),
    importProvidersFrom(SocketIoModule.forRoot(config))
  ]

};
