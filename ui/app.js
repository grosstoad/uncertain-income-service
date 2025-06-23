class UncertainIncomeCalculator {
    constructor() {
        // Use relative URL for production, localhost for development
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/v1/calculate'  // Development
            : '/api/calculateUncertainIncome';  // Production
        this.currentFields = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateConditionalFields('');
    }

    bindEvents() {
        const incomeTypeSelect = document.getElementById('incomeType');
        const form = document.getElementById('incomeForm');

        incomeTypeSelect.addEventListener('change', (e) => {
            this.updateConditionalFields(e.target.value);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateIncome();
        });
    }

    getFieldConfigurations() {
        return {
            OVERTIME: {
                title: 'Overtime Income Fields',
                required: [
                    { name: 'verificationMethod', type: 'select', label: 'Verification Method', options: [
                        { value: 'NON_ESSENTIAL_SERVICES', text: 'Non-Essential Services' },
                        { value: 'ESSENTIAL_SERVICES', text: 'Essential Services' }
                    ], description: 'Type of overtime verification required' },
                    { name: 'salaryFrequency', type: 'select', label: 'Salary Frequency', options: [
                        { value: 'WEEKLY', text: 'Weekly' },
                        { value: 'FORTNIGHTLY', text: 'Fortnightly' },
                        { value: 'MONTHLY', text: 'Monthly' }
                    ], description: 'How often the base salary is paid' },
                    { name: 'baseIncome', type: 'number', label: 'Base Income per Pay Period', step: '0.01', min: '0', max: '99999999.99', description: 'Base salary amount per pay period (excluding overtime)' },
                    { name: 'endDateLatestPayslip', type: 'date', label: 'End Date of Latest Payslip', description: 'Date when the latest payslip period ended' },
                    { name: 'employmentStartDate', type: 'date', label: 'Employment Start Date', description: 'When employment began (affects eligibility)' },
                    { name: 'ytdAmountLatestPayslip', type: 'number', label: 'YTD Amount on Latest Payslip', step: '0.01', min: '0', max: '99999999.99', description: 'Total year-to-date amount shown on latest payslip' }
                ],
                optional: [
                    { name: 'lastFyAnnualIncome', type: 'number', label: 'Last Financial Year Annual Income', step: '0.01', min: '0', max: '99999999.99', description: 'Required if payslip is less than 6 months into FY' },
                    { name: 'annualOverrideAmount', type: 'number', label: 'Annual Override Amount', step: '0.01', min: '0', max: '99999999.99', description: 'Manual override for calculated amount' }
                ]
            },
            CASUAL: {
                title: 'Casual Employment Fields',
                required: [
                    { name: 'salaryFrequency', type: 'select', label: 'Salary Frequency', options: [
                        { value: 'WEEKLY', text: 'Weekly' },
                        { value: 'FORTNIGHTLY', text: 'Fortnightly' },
                        { value: 'MONTHLY', text: 'Monthly' }
                    ], description: 'How often casual income is received' },
                    { name: 'endDateLatestPayslip', type: 'date', label: 'End Date of Latest Payslip', description: 'Date when the latest payslip period ended' },
                    { name: 'employmentStartDate', type: 'date', label: 'Employment Start Date', description: 'When casual employment began' },
                    { name: 'ytdAmountLatestPayslip', type: 'number', label: 'YTD Amount on Latest Payslip', step: '0.01', min: '0', max: '99999999.99', description: 'Total year-to-date casual income' }
                ],
                optional: [
                    { name: 'lastFyAnnualIncome', type: 'number', label: 'Last Financial Year Annual Income', step: '0.01', min: '0', max: '99999999.99', description: 'Required if payslip is less than 6 months into FY' },
                    { name: 'annualOverrideAmount', type: 'number', label: 'Annual Override Amount', step: '0.01', min: '0', max: '99999999.99', description: 'Manual override for calculated amount' }
                ]
            },
            CONTRACT_VARIABLE: {
                title: 'Contract Variable Income Fields',
                required: [
                    { name: 'salaryFrequency', type: 'select', label: 'Salary Frequency', options: [
                        { value: 'WEEKLY', text: 'Weekly' },
                        { value: 'FORTNIGHTLY', text: 'Fortnightly' },
                        { value: 'MONTHLY', text: 'Monthly' }
                    ], description: 'How often contract income is received' },
                    { name: 'endDateLatestPayslip', type: 'date', label: 'End Date of Latest Payslip', description: 'Date when the latest payslip period ended' },
                    { name: 'employmentStartDate', type: 'date', label: 'Employment Start Date', description: 'When contract employment began' },
                    { name: 'ytdAmountLatestPayslip', type: 'number', label: 'YTD Amount on Latest Payslip', step: '0.01', min: '0', max: '99999999.99', description: 'Total year-to-date contract income' }
                ],
                optional: [
                    { name: 'lastFyAnnualIncome', type: 'number', label: 'Last Financial Year Annual Income', step: '0.01', min: '0', max: '99999999.99', description: 'Required if payslip is less than 6 months into FY' },
                    { name: 'annualOverrideAmount', type: 'number', label: 'Annual Override Amount', step: '0.01', min: '0', max: '99999999.99', description: 'Manual override for calculated amount' }
                ]
            },
            COMMISSIONS: {
                title: 'Commission Income Fields',
                required: [
                    { name: 'salaryFrequency', type: 'select', label: 'Salary Frequency', options: [
                        { value: 'WEEKLY', text: 'Weekly' },
                        { value: 'FORTNIGHTLY', text: 'Fortnightly' },
                        { value: 'MONTHLY', text: 'Monthly' }
                    ], description: 'Base salary payment frequency' },
                    { name: 'baseIncome', type: 'number', label: 'Base Income per Pay Period', step: '0.01', min: '0', max: '99999999.99', description: 'Base salary excluding commissions' },
                    { name: 'endDateLatestPayslip', type: 'date', label: 'End Date of Latest Payslip', description: 'Date when the latest payslip period ended' },
                    { name: 'employmentStartDate', type: 'date', label: 'Employment Start Date', description: 'When employment began' },
                    { name: 'ytdAmountLatestPayslip', type: 'number', label: 'YTD Amount on Latest Payslip', step: '0.01', min: '0', max: '99999999.99', description: 'Total YTD amount including base + commissions' }
                ],
                optional: [
                    { name: 'lastFyAnnualIncome', type: 'number', label: 'Last Financial Year Annual Income', step: '0.01', min: '0', max: '99999999.99', description: 'Required if payslip is less than 12 months into FY' },
                    { name: 'annualOverrideAmount', type: 'number', label: 'Annual Override Amount', step: '0.01', min: '0', max: '99999999.99', description: 'Manual override for calculated amount' },
                    { name: 'actualYtdCommission', type: 'number', label: 'Actual YTD Commission', step: '0.01', min: '0', max: '99999999.99', description: 'Actual commission received this year (takes priority)' }
                ]
            },
            BONUS: {
                title: 'Bonus Income Fields',
                required: [
                    { name: 'verificationMethod', type: 'select', label: 'Verification Method', options: [
                        { value: 'ONE_YEAR_VERIFICATION', text: 'One Year Verification' },
                        { value: 'TWO_YEAR_VERIFICATION', text: 'Two Year Verification' }
                    ], description: 'How many years of bonus history to consider' },
                    { name: 'currentFyBonus', type: 'number', label: 'Current Financial Year Bonus', step: '0.01', min: '0', max: '99999999.99', description: 'Expected bonus for current financial year' }
                ],
                optional: [
                    { name: 'lastFyBonus', type: 'number', label: 'Last Financial Year Bonus', step: '0.01', min: '0', max: '99999999.99', description: 'Required for two-year verification' },
                    { name: 'actualYtdBonus', type: 'number', label: 'Actual YTD Bonus', step: '0.01', min: '0', max: '99999999.99', description: 'Actual bonus received this year (direct calculation)' }
                ]
            },
            INVESTMENT_SHARES: {
                title: 'Investment Shares Income Fields',
                required: [
                    { name: 'currentFy', type: 'number', label: 'Current Financial Year Income', step: '0.01', min: '0', max: '99999999.99', description: 'Expected share investment income for current FY' },
                    { name: 'lastFy', type: 'number', label: 'Last Financial Year Income', step: '0.01', min: '0', max: '99999999.99', description: 'Share investment income from last FY' }
                ],
                optional: [
                    { name: 'actualYtdInvestmentIncome', type: 'number', label: 'Actual YTD Investment Income', step: '0.01', min: '0', max: '99999999.99', description: 'Actual investment income received this year (direct calculation)' }
                ]
            },
            INVESTMENT_INTEREST: {
                title: 'Investment Interest Income Fields',
                required: [
                    { name: 'currentFy', type: 'number', label: 'Current Financial Year Income', step: '0.01', min: '0', max: '99999999.99', description: 'Expected interest income for current FY' },
                    { name: 'lastFy', type: 'number', label: 'Last Financial Year Income', step: '0.01', min: '0', max: '99999999.99', description: 'Interest income from last FY' }
                ],
                optional: [
                    { name: 'actualYtdInvestmentIncome', type: 'number', label: 'Actual YTD Investment Income', step: '0.01', min: '0', max: '99999999.99', description: 'Actual investment income received this year (direct calculation)' }
                ]
            }
        };
    }

    updateConditionalFields(incomeType) {
        const container = document.getElementById('conditionalFields');
        container.innerHTML = '';

        if (!incomeType) {
            return;
        }

        const config = this.getFieldConfigurations()[incomeType];
        if (!config) {
            return;
        }

        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'conditional-fields';
        fieldsContainer.innerHTML = `<h4>${config.title}</h4>`;

        // Add required fields
        config.required.forEach(field => {
            fieldsContainer.appendChild(this.createFieldElement(field, true));
        });

        // Add optional fields
        if (config.optional && config.optional.length > 0) {
            const optionalTitle = document.createElement('h4');
            optionalTitle.textContent = 'Optional Fields';
            optionalTitle.style.marginTop = '25px';
            fieldsContainer.appendChild(optionalTitle);

            config.optional.forEach(field => {
                fieldsContainer.appendChild(this.createFieldElement(field, false));
            });
        }

        container.appendChild(fieldsContainer);
    }

    createFieldElement(field, isRequired) {
        const formGroup = document.createElement('div');
        formGroup.className = `form-group ${!isRequired ? 'optional-field' : ''}`;

        const label = document.createElement('label');
        label.textContent = field.label + (isRequired ? ' *' : '');
        label.setAttribute('for', field.name);

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.innerHTML = '<option value="">Select...</option>';
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
            if (field.step) input.step = field.step;
            if (field.min) input.min = field.min;
            if (field.max) input.max = field.max;
        }

        input.id = field.name;
        input.name = field.name;
        if (isRequired) input.required = true;

        const description = document.createElement('div');
        description.className = 'field-description';
        description.textContent = field.description;

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        formGroup.appendChild(description);

        return formGroup;
    }

    async calculateIncome() {
        const form = document.getElementById('incomeForm');
        const formData = new FormData(form);
        const calculateBtn = document.getElementById('calculateBtn');
        
        // Prepare the request data
        const requestData = {
            incomeType: formData.get('incomeType')
        };

        // Add all form fields to request data
        for (let [key, value] of formData.entries()) {
            if (key !== 'incomeType' && value) {
                // Convert numeric fields
                if (this.isNumericField(key)) {
                    requestData[key] = parseFloat(value);
                } else {
                    requestData[key] = value;
                }
            }
        }

        // Show loading state
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<span class="loading"></span>Calculating...';

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                this.displaySuccessResult(result);
            } else {
                this.displayErrorResult(result);
            }
        } catch (error) {
            this.displayErrorResult({
                success: false,
                errors: [{
                    field: 'connection',
                    code: 'CONNECTION_ERROR',
                    message: `Failed to connect to API: ${error.message}`,
                    value: null,
                    path: '$'
                }],
                timestamp: new Date().toISOString(),
                requestId: 'client-error'
            });
        } finally {
            calculateBtn.disabled = false;
            calculateBtn.innerHTML = 'Calculate Allowable Income';
        }
    }

    isNumericField(fieldName) {
        const numericFields = [
            'baseIncome', 'ytdAmountLatestPayslip', 'lastFyAnnualIncome', 
            'annualOverrideAmount', 'actualYtdAmount', 'actualYtdCommission',
            'currentFyBonus', 'lastFyBonus', 'actualYtdBonus',
            'currentFy', 'lastFy', 'actualYtdInvestmentIncome'
        ];
        return numericFields.includes(fieldName);
    }

    displaySuccessResult(result) {
        const container = document.getElementById('resultContainer');
        const data = result.data;
        
        container.innerHTML = `
            <div class="result-container result-success">
                <div class="result-title">✅ Calculation Successful</div>
                
                <div class="detail-row">
                    <span>Income Type:</span>
                    <span>${data.incomeType}</span>
                </div>
                
                ${data.verificationMethod ? `
                <div class="detail-row">
                    <span>Verification Method:</span>
                    <span>${data.verificationMethod.replace(/_/g, ' ')}</span>
                </div>` : ''}
                
                <div class="detail-row">
                    <span>Eligible:</span>
                    <span style="color: ${data.eligible ? '#28a745' : '#dc3545'}">
                        ${data.eligible ? 'Yes' : 'No'}
                    </span>
                </div>
                
                <div class="calculation-details">
                    <h4>Calculation Details</h4>
                    ${this.formatCalculationDetails(data.calculationDetails)}
                </div>
                
                <div class="detail-row">
                    <span><strong>Allowable Annual Income:</strong></span>
                    <span><strong>$${this.formatCurrency(data.allowableAnnualIncome)}</strong></span>
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
                    <div>API Version: ${result.versions.api}</div>
                    <div>Logic Version: ${result.versions.logic}</div>
                </div>
            </div>
        `;
    }

    displayErrorResult(result) {
        const container = document.getElementById('resultContainer');
        
        container.innerHTML = `
            <div class="result-container result-error">
                <div class="result-title">❌ Calculation Failed</div>
                
                <ul class="error-list">
                    ${result.errors.map(error => `
                        <li class="error-item">
                            <strong>${error.field}:</strong> ${error.message}
                            ${error.value !== null ? `<br><small>Value: ${error.value}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
                
                <div style="margin-top: 15px; font-size: 12px; color: #6c757d;">
                    Request ID: ${result.requestId || 'N/A'}<br>
                    Timestamp: ${result.timestamp || new Date().toISOString()}
                </div>
            </div>
        `;
    }

    formatCalculationDetails(details) {
        if (!details) return '<p>No calculation details available</p>';
        
        const formatters = {
            annualBaseSalary: 'Annual Base Salary',
            expectedYtdBaseSalary: 'Expected YTD Base Salary',
            daysPayCycleConversion: 'Pay Cycles',
            averageAmountPerPayCycle: 'Average Amount per Pay Cycle',
            averageAmountLessBaseIncomeAnnual: 'Average Amount Less Base Income (Annual)',
            averageAmountLessBaseIncomeMonthly: 'Average Amount Less Base Income (Monthly)'
        };

        return Object.entries(details)
            .map(([key, value]) => {
                const label = formatters[key] || key.replace(/([A-Z])/g, ' $1').trim();
                const formattedValue = typeof value === 'number' 
                    ? (key === 'daysPayCycleConversion' ? value.toString() : `$${this.formatCurrency(value)}`)
                    : value;
                    
                return `
                    <div class="detail-row">
                        <span>${label}:</span>
                        <span>${formattedValue}</span>
                    </div>
                `;
            })
            .join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UncertainIncomeCalculator();
}); 