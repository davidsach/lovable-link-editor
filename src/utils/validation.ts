
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PythonValidationResult extends ValidationResult {
  syntaxErrors: Array<{
    line: number;
    message: string;
  }>;
}

export const validatePythonCode = (code: string): PythonValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const syntaxErrors: Array<{ line: number; message: string }> = [];

  if (!code.trim()) {
    errors.push('Python code cannot be empty');
    return { isValid: false, errors, warnings, syntaxErrors };
  }

  // Check for potentially unsafe operations
  const unsafePatterns = [
    { pattern: /import\s+os/, message: 'OS module access is restricted for security' },
    { pattern: /import\s+subprocess/, message: 'Subprocess module is not allowed' },
    { pattern: /exec\s*\(/, message: 'Dynamic code execution (exec) is not allowed' },
    { pattern: /eval\s*\(/, message: 'Dynamic code evaluation (eval) is not allowed' },
    { pattern: /open\s*\(/, message: 'File operations may be restricted' },
    { pattern: /while\s+True\s*:/, message: 'Infinite loops are not recommended' },
  ];

  const lines = code.split('\n');
  lines.forEach((line, index) => {
    unsafePatterns.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        warnings.push(`Line ${index + 1}: ${message}`);
      }
    });
  });

  // Basic syntax validation (simplified)
  const brackets = { '(': 0, '[': 0, '{': 0 };
  const closingBrackets = { ')': '(', ']': '[', '}': '{' };
  
  lines.forEach((line, index) => {
    for (const char of line) {
      if (char in brackets) {
        brackets[char as keyof typeof brackets]++;
      } else if (char in closingBrackets) {
        const opening = closingBrackets[char as keyof typeof closingBrackets];
        if (brackets[opening as keyof typeof brackets] > 0) {
          brackets[opening as keyof typeof brackets]--;
        } else {
          syntaxErrors.push({
            line: index + 1,
            message: `Unmatched closing bracket '${char}'`
          });
        }
      }
    }
  });

  // Check for unmatched opening brackets
  Object.entries(brackets).forEach(([bracket, count]) => {
    if (count > 0) {
      syntaxErrors.push({
        line: lines.length,
        message: `Unmatched opening bracket '${bracket}'`
      });
    }
  });

  const isValid = errors.length === 0 && syntaxErrors.length === 0;
  
  return { isValid, errors, warnings, syntaxErrors };
};

export const validateExampleMetadata = (name: string, description: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name.trim()) {
    errors.push('Example name is required');
  } else if (name.length < 3) {
    errors.push('Example name must be at least 3 characters long');
  } else if (name.length > 100) {
    errors.push('Example name cannot exceed 100 characters');
  }

  if (description && description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (!description.trim()) {
    warnings.push('Adding a description helps others understand this example');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

export const validateMessageContent = (content: string, type: 'text' | 'tool_call' | 'tool_result'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content.trim()) {
    errors.push(`${type === 'text' ? 'Message' : type.replace('_', ' ')} content cannot be empty`);
  }

  if (type === 'text' && content.length > 2000) {
    errors.push('Message content is too long (max 2000 characters)');
  }

  if (type === 'text' && content.length < 5) {
    warnings.push('Very short messages may not provide enough context');
  }

  return { isValid: errors.length === 0, errors, warnings };
};
