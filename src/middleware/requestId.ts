import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { nanoid } from 'nanoid';

// Extend Context to include our custom requestId
interface ExtendedContext extends Context {
  requestId?: string;
}

export const requestId = () => ({
  before: async (request: { event: APIGatewayProxyEvent; context: ExtendedContext }) => {
    const requestId = request.event.headers?.['X-Request-ID'] 
      || request.event.headers?.['x-request-id'] 
      || nanoid();
    
    // Store request ID in context for later use
    request.context.requestId = requestId;
  },
});

export const getRequestId = (context: Context): string => {
  return (context as ExtendedContext).requestId || nanoid();
}; 