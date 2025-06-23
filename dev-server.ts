import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateUncertainIncome } from './src/calculateUncertainIncome';
import { parse, UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY } from './src/parse';
import { InvalidInputError } from './src/utils/InvalidInputError';
import { BusinessLogicError } from './src/utils/BusinessLogicError';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Uncertain Income API Server',
    endpoints: {
      calculate: 'POST /v1/calculate'
    }
  });
});

// Main calculation endpoint
app.post('/v1/calculate', (req: Request, res: Response) => {
  try {
    console.log('Received request:', JSON.stringify(req.body, null, 2));
    
    // Parse and validate request
    const validatedRequest = parse(UNCERTAIN_INCOME_REQUEST_SCHEMA_KEY, req.body);
    console.log('Validated request:', JSON.stringify(validatedRequest, null, 2));
    
    // Calculate income
    const result = calculateUncertainIncome(validatedRequest as any);
    console.log('Calculation result:', JSON.stringify(result, null, 2));
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof BusinessLogicError) {
      // Business logic validation errors - HTTP 422
      res.status(422).json({
        success: false,
        errors: error.errors || [
          {
            field: 'general',
            code: 'BUSINESS_LOGIC_ERROR',
            message: error.message,
            value: null,
            path: '$'
          }
        ],
        timestamp: new Date().toISOString(),
        requestId: 'dev-' + Date.now()
      });
    } else if (error instanceof InvalidInputError) {
      // Schema validation errors - HTTP 400
      res.status(400).json({
        success: false,
        errors: error.errors || [
          {
            field: 'general',
            code: 'INVALID_INPUT',
            message: error.message,
            value: null,
            path: '$'
          }
        ],
        timestamp: new Date().toISOString(),
        requestId: 'dev-' + Date.now()
      });
    } else {
      // Unexpected errors - HTTP 500
      res.status(500).json({
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
        requestId: 'dev-' + Date.now()
      });
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 Uncertain Income API Server running on http://localhost:${port}`);
  console.log(`📊 Main endpoint: POST http://localhost:${port}/v1/calculate`);
  console.log(`🏥 Health check: GET http://localhost:${port}/`);
});

export default app; 