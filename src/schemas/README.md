# Uncertain Income Service - YAML Models

This directory contains YAML model definitions for the Uncertain Income Service API. Following the serviceability service pattern, each schema component is defined in a separate YAML file for better maintainability and reusability.

## Model Files

### Core Enums
- **`IncomeType.yml`** - Supported income types (OVERTIME, CASUAL, etc.)
- **`VerificationMethod.yml`** - Verification methods for specific income types
- **`SalaryFrequency.yml`** - Pay frequency options (WEEKLY, FORTNIGHTLY, MONTHLY)

### Request/Response Schemas
- **`UncertainIncomeRequest.yml`** - Main request schema with conditional validation
- **`UncertainIncomeResponse.yml`** - Successful response schema
- **`ErrorResponse.yml`** - Error response schema with detailed error codes

### Supporting Objects
- **`CalculationDetails.yml`** - Calculation breakdown object schema

## Usage

These YAML files are referenced in the main OpenAPI specification (`src/openApi/OpenAPI.yml`) using `$ref` syntax:

```yaml
components:
  schemas:
    UncertainIncomeRequestV1:
      $ref: '../v1/models/UncertainIncomeRequest.yml'
    IncomeType:
      $ref: '../v1/models/IncomeType.yml'
```

## Schema Validation

The schemas support:
- Conditional field requirements based on income type
- Comprehensive field validation (ranges, formats, patterns)
- Detailed error response structures
- Australian Financial Year date handling (YYYY-MM-DD format) 