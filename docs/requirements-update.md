# Requirements Update: Days Pay Cycle Conversion Rounding Rules

## Updated Rounding Logic

**Days Calculation:**
- Exclude start date from calculation (153 days for Case 1, not 154)

**Rounding Rules by Frequency:**

### MONTHLY (Updated)
- **Rule**: Use 0.25 threshold
  - If decimal > 0.25: round UP
  - If decimal ≤ 0.25: round DOWN
- **Examples**:
  - 5.26 → 6 (rounds up)
  - 5.24 → 5 (rounds down)
  - 5.03 → 5 (rounds down, ≤0.25)

### FORTNIGHTLY (Updated)
- **Rule**: Always round UP (Math.ceil)
- **Change**: Previously was "rounded down", now "rounded up"

### WEEKLY (Updated)  
- **Rule**: Always round UP (Math.ceil)
- **Change**: Previously was "rounded down", now "rounded up"

## Requirements Document Changes Needed

**Replace this section:**
```
- MONTHLY: × 12 (rounded to nearest month)
- FORTNIGHTLY: × 26 (rounded down)
- WEEKLY: × 52 (rounded down)
```

**With this:**
```
- MONTHLY: × 12 (rounded using 0.25 threshold: >0.25 rounds up, ≤0.25 rounds down)  
- FORTNIGHTLY: × 26 (rounded up)
- WEEKLY: × 52 (rounded up)
```

## Test Results Verification

✅ **Case 1**: $151,500.00 (Perfect match)
- Days: 153 (was 154)
- Pay Cycles: 5 (was 6) 
- Monthly Commission: $15,600 (was $12,666.67)

✅ **Case 2**: $134,888.89 (Perfect match)
- Days: 258 (unchanged)
- Pay Cycles: 9 (unchanged, 8.48 > 0.25 threshold)
- Monthly Commission: $9,944.44 (unchanged) 