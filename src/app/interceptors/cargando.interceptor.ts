import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CargandoService } from '../services/cargando.service';

export const cargandoInterceptor: HttpInterceptorFn = (req, next) => {
  const cargandoService = inject(CargandoService);
  if(!parseInt(req.headers.get("SaltarCargando") || "0")){
    cargandoService.cargando = true;
  }
  req.headers.delete("SaltarCargando");
  return next(req)
};