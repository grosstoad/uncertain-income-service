export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value: any;
  path: string;
}

export class InvalidInputError extends Error {
  public errors: ValidationError[];

  constructor(message: string, errors?: ValidationError[]) {
    super(message);
    this.name = 'InvalidInputError';
    this.errors = errors || [
      {
        field: 'general',
        code: 'INVALID_INPUT',
        message: message,
        value: null,
        path: '$'
      }
    ];
  }

  static fromAjvErrors(ajvErrors: any[]): InvalidInputError {
    const validationErrors: ValidationError[] = ajvErrors.map(error => {
      // Enhanced error code mapping
      let code = 'VALIDATION_ERROR';
      
      switch (error.keyword) {
        case 'required':
          code = 'MISSING_REQUIRED_FIELD';
          break;
        case 'type':
          code = 'INVALID_DATA_TYPE';
          break;
        case 'format':
          if (error.schema === 'date') {
            code = 'INVALID_DATE_FORMAT';
          }
          break;
        case 'enum':
          code = 'INVALID_ENUM_VALUE';
          break;
        case 'minimum':
        case 'maximum':
          code = 'OUT_OF_RANGE';
          break;
        case 'multipleOf':
          code = 'INVALID_DECIMAL_PRECISION';
          break;
        default:
          code = error.keyword?.toUpperCase() || 'VALIDATION_ERROR';
      }

      // Enhanced field name extraction
      let field = 'unknown';
      if (error.instancePath) {
        field = error.instancePath.replace(/^\//, '').replace(/\//g, '.');
      } else if (error.params?.missingProperty) {
        field = error.params.missingProperty;
      } else if (error.schemaPath) {
        const pathParts = error.schemaPath.split('/');
        field = pathParts[pathParts.length - 1] || 'unknown';
      }

      // Enhanced error messages
      let message = error.message || 'Validation failed';
      if (error.keyword === 'required' && error.params?.missingProperty) {
        message = `Required field '${error.params.missingProperty}' is missing or empty`;
      } else if (error.keyword === 'enum' && error.allowedValues) {
        message = `Invalid value '${error.data}' for field '${field}'. Must be one of: ${error.allowedValues.join(', ')}`;
      }

      return {
        field,
        code,
        message,
        value: error.data,
        path: error.instancePath || '$'
      };
    });

    return new InvalidInputError(
      `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
      validationErrors
    );
  }
} 