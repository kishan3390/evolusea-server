import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { DomainError, DomainErrorType } from '@building-blocks/domain';

export const domainErrorStatus = {
  [DomainErrorType.DomainRuleViolation]: HttpStatus.UNPROCESSABLE_ENTITY,
  [DomainErrorType.AccessDenied]: HttpStatus.UNAUTHORIZED,
  [DomainErrorType.PermissionDenied]: HttpStatus.FORBIDDEN,
  [DomainErrorType.NotFound]: HttpStatus.NOT_FOUND,
  [DomainErrorType.NonUnique]: HttpStatus.UNPROCESSABLE_ENTITY,
  [DomainErrorType.InternalError]: HttpStatus.BAD_REQUEST,
  [DomainErrorType.ValidationError]: HttpStatus.BAD_REQUEST,
};

@Catch(DomainError)
export class DomainErrorFilter extends BaseExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      domainErrorStatus[exception.type] || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      type: exception.type,
      message: exception.message,
      title: exception.name,
      data: exception.getData(),
    });
  }
}
