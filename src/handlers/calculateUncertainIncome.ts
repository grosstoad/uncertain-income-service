import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { namedJsonLogger } from '../utils/logger';
import { requestId, getRequestId } from '../middleware/requestId';
import { errorHandler } from '../middleware/errorHandler';
import { UncertainIncomeRequest } from '../types';
import { InvalidInputError } from '../utils/InvalidInputError';
import { BusinessLogicError } from '../utils/BusinessLogicError';
import { parse, UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY } from '../parse';
import { calculateUncertainIncome } from '../calculateUncertainIncome';

const baseHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const reqId = getRequestId(context);
  const logId = `${event.requestContext.requestId} ${reqId}`;
  const logger = namedJsonLogger('calculateUncertainIncomeHandler', logId);

  logger.info('Uncertain income calculation request received');

  // Parse and validate the request body
  const request = parse<UncertainIncomeRequest>(
    UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY, 
    event.body
  );

  logger.info(`Calculating uncertain income for type: ${request.incomeType}`);

  // Perform the calculation
  const result = calculateUncertainIncome(request);

  logger.info('Uncertain income calculation completed successfully', {
    incomeType: result.data.incomeType,
    allowableAnnualIncome: result.data.allowableAnnualIncome,
    eligible: result.data.eligible,
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': reqId,
    },
    body: JSON.stringify(result),
  };
};

export const handler = middy(baseHandler)
  .use(requestId())
  .use(jsonBodyParser())
  .use(errorHandler(getRequestId, [
    { errorType: InvalidInputError, responseStatusCode: 400 },
    { errorType: BusinessLogicError, responseStatusCode: 422 },
  ])); 