import { Context } from 'aws-lambda';
import { namedJsonLogger } from '../utils/logger';
import { InvalidInputError } from '../utils/InvalidInputError';
import { UncertainIncomeErrorResponse } from '../types';

interface ErrorConfig {
  errorType: new (...args: any[]) => Error;
  responseStatusCode: number;
}

export const errorHandler = (
  getRequestId: (context: Context) => string,
  errorConfigs: ErrorConfig[]
) => ({
  onError: async (request: any) => {
    const { error, context } = request;
    const requestId = getRequestId(context);
    const logger = namedJsonLogger('errorHandler', requestId);

    logger.error('Request failed', {
      error: error.message,
      stack: error.stack,
    });

    // Find matching error configuration
    const errorConfig = errorConfigs.find(config => error instanceof config.errorType);

    if (errorConfig) {
      // Handle known error types
      const errorResponse: UncertainIncomeErrorResponse = {
        success: false,
        errors: error instanceof InvalidInputError ? error.errors : [
          {
            field: 'general',
            code: 'INTERNAL_ERROR',
            message: error.message,
            value: null,
            path: '$'
          }
        ],
        timestamp: new Date().toISOString(),
        requestId,
      };

      request.response = {
        statusCode: errorConfig.responseStatusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID',
        },
        body: JSON.stringify(errorResponse),
      };
    } else {
      // Handle unknown errors as 500
      const errorResponse: UncertainIncomeErrorResponse = {
        success: false,
        errors: [
          {
            field: 'general',
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            value: null,
            path: '$'
          }
        ],
        timestamp: new Date().toISOString(),
        requestId,
      };

      request.response = {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID',
        },
        body: JSON.stringify(errorResponse),
      };
    }
  },
}); 