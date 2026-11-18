import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authorization = inject(AuthService).authorizationHeader();
  if (!authorization) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: authorization } }));
};
