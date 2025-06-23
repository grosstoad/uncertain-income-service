/**
 * Simple logger implementation to replace @athenamortgages/athena-lib-logger
 */
export interface Logger {
  info: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
}

export const namedJsonLogger = (name: string, requestId?: string): Logger => {
  const prefix = requestId ? `[${name}] [${requestId}]` : `[${name}]`;
  
  return {
    info: (message: string, data?: any) => {
      console.info(`${prefix} INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    error: (message: string, data?: any) => {
      console.error(`${prefix} ERROR: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    warn: (message: string, data?: any) => {
      console.warn(`${prefix} WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    debug: (message: string, data?: any) => {
      console.debug(`${prefix} DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  };
}; 