import { HttpInterceptorFn } from '@angular/common/http';

/**
 * API Interceptor - Ready for backend integration.
 *
 * When you add a backend, configure:
 * 1. Base URL prefix for all API calls
 * 2. Auth token injection from stored JWT
 * 3. Error handling and refresh token logic
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: When backend is ready, uncomment and configure:
  // const baseUrl = 'http://localhost:3000/api';
  // const token = localStorage.getItem('noah_auth_token');
  //
  // const apiReq = req.clone({
  //   url: `${baseUrl}${req.url}`,
  //   setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  // });
  //
  // return next(apiReq);

  return next(req);
};
