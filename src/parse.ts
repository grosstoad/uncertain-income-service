import Ajv from 'ajv';

import * as uncertainIncomeRequestSchema from './schemas/uncertainIncomeRequest.json';
import { InvalidInputError } from './utils/InvalidInputError';

export const UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY = 'athena-uncertain-income-request';

export const ajvGlobal = new Ajv({
  allErrors: true,
  strictSchema: true,
});

ajvGlobal.addSchema(
  uncertainIncomeRequestSchema,
  UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY,
);

/**
 * Validates an object against an AJV (JSON) schema. When the object is valid, returns it with
 * type information.
 */
export function parse<T>(schemaKey: string, data: unknown, ajv = ajvGlobal): T {
  const validate = ajv.getSchema<T>(schemaKey);

  if (!validate) {
    throw new InvalidInputError(`Failed to load schema '${schemaKey}'. Either the schema has not been added to the global AJV object or there is a validation issue with the schema document. This is a bug!`);
  }
  if (!validate(data)) {
    throw InvalidInputError.fromAjvErrors(validate.errors || []);
  }
  return data as T;
} 