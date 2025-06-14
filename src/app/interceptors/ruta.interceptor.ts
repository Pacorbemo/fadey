import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environments';

export const rutaInterceptor : HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ url: `${environment.serverUrl}${req.url}` });
  return next(apiReq);
};