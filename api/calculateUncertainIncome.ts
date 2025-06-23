// Vercel serverless function wrapper
import { VercelRequest, VercelResponse } from '@vercel/node';
import { handler } from '../src/handlers/calculateUncertainIncome';

export default async function (req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID');
    res.status(200).end();
    return;
  }

  // Convert Vercel request to AWS Lambda format
  const event = {
    httpMethod: req.method,
    headers: req.headers,
    body: req.method === 'POST' ? JSON.stringify(req.body) : null,
    pathParameters: null,
    queryStringParameters: req.query,
    requestContext: {
      requestId: Math.random().toString(),
      stage: 'dev',
    },
  };

  const context = {
    awsRequestId: Math.random().toString(),
    getRemainingTimeInMillis: () => 30000,
  };

  try {
    // Call the Lambda handler
    const result = await handler(event as any, context as any, () => {});
    
    // Convert Lambda response to Vercel format
    if (result && typeof result === 'object' && 'statusCode' in result) {
      res.status(result.statusCode);
      
      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
      }
      
      res.json(JSON.parse(result.body));
    } else {
      res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}