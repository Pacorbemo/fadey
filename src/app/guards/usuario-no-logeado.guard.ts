import { CanActivateFn, Router } from '@angular/router';
import { DatosService } from '../services/datos.service';
import { inject } from '@angular/core';

export const usuarioNoLogeadoGuard: CanActivateFn = (route, state) => {
  const datosService = inject(DatosService);
  const router = inject(Router);

  return datosService.tokenUsuario
    ? router.createUrlTree(['/'])
    : true;
};
