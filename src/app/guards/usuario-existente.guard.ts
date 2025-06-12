import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import { map } from 'rxjs';

export const usuarioExistenteGuard: CanActivateFn = (route, state) => {
  const usuariosService = inject(UsuariosService);
  const router = inject(Router);

  const username = route.params['username'];
  return usuariosService.datosUsername(username).pipe(
    map(response => {
      if (response.exists) {
        return true;
      } else {
        return router.createUrlTree(['/']);
      }
    })
  );
};
