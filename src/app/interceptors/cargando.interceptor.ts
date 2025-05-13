import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { CargandoService } from '../services/cargando.service';

export const cargandoInterceptor: HttpInterceptorFn = (req, next) => {
  const cargandoService = inject(CargandoService);
  cargandoService.cargando = true;
  return next(req).pipe(finalize(() =>  (cargandoService.cargando = false)));
};