import { CanActivateFn, Router } from '@angular/router';
import { DatosService } from '../services/datos.service';
import { inject } from '@angular/core';

export const 
authGuard: CanActivateFn = () => {
  const datosService = inject(DatosService);
  const router = inject(Router);

  return datosService.tokenUsuario
    ? true
    : router.createUrlTree(['/inicio-sesion']);
};
