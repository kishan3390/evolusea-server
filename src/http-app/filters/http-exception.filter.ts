import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { RFCErrorResponse } from './models/rfc-error-response';

interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let title, detail;

    switch (typeof exceptionResponse) {
      case 'object':
        title = (exceptionResponse as HttpExceptionResponse).error
          ? (exceptionResponse as HttpExceptionResponse).error
          : exception.name;
        detail = (exceptionResponse as HttpExceptionResponse).message;
        break;
      default:
        title = exception.name;
        detail = exceptionResponse;
        break;
    }

    response.status(status).json(<RFCErrorResponse>{
      status,
      type: exception.name,
      instance: request.path,
      title,
      detail,
    });
  }
}
