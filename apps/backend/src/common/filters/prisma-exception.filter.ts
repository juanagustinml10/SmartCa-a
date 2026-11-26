import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface PrismaError {
  code: string;
  meta?: Record<string, unknown>;
  message?: string;
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const prismaError = exception as PrismaError;

    if (prismaError.code?.startsWith?.('P')) {
      const result = this.mapPrismaError(prismaError);
      return response.status(result.status).json({
        statusCode: result.status,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    }

    throw exception;
  }

  private mapPrismaError(err: PrismaError) {
    switch (err.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: `El valor ya existe${err.meta?.target ? ` (${(err.meta.target as string[]).join(', ')})` : ''}`,
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Referencia inválida: el registro relacionado no existe',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Registro no encontrado',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Error inesperado en la base de datos',
        };
    }
  }
}
