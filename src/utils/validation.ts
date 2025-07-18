
/**
 * Validation Utilities for Tool Trainer
 * 
 * This module provides validation functions for Python code and other user inputs
 * in the tool trainer application. It includes safety checks, syntax validation,
 * and helpful error messages for common issues.
 * 
 * Key Features:
 * - Python code syntax validation
 * - Security checks for unsafe operations
 * - Line-by-line error reporting
 * - Warnings for potential issues
 * - User-friendly error messages
 * 
 * @fileoverview Validation utilities for code and input validation
 */

/**
 * Base interface for validation results
 */
export interface ValidationResult {
  /** Whether the input passed validation */
  isValid: boolean;
  /** Array of error messages */
  errors: string[];
  /** Array of warning messages */
  warnings: string[];
}

/**
 * Extended validation result interface for Python code validation
 * Includes line-specific syntax error information
 */
export interface PythonValidationResult extends ValidationResult {
  /** Array of syntax errors with line numbers */
  syntaxErrors: Array<{
    /** Line number where the error occurs (1-indexed) */
    line: number;
    /** Human-readable error message */
    message: string;
  }>;
}

/**
 * Validates Python code for security, syntax, and best practices
 * 
 * This function performs comprehensive validation of Python code including:
 * - Basic syntax checking
 * - Security vulnerability detection
 * - Common error pattern detection
 * - Style and best practice warnings
 * 
 * @param code - The Python code string to validate
 * @returns Detailed validation result with errors, warnings, and syntax errors
 */
export const validatePythonCode = (code: string): PythonValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const syntaxErrors: Array<{ line: number; message: string }> = [];

  if (!code.trim()) {
    errors.push('Python code cannot be empty');
    return { isValid: false, errors, warnings, syntaxErrors };
  }

  // Check for potentially unsafe operations with friendlier messages
  const unsafePatterns = [
    { pattern: /import\s+os/, message: 'OS module access is not allowed for security reasons' },
    { pattern: /import\s+subprocess/, message: 'Subprocess module is not allowed for security reasons' },
    { pattern: /exec\s*\(/, message: 'Dynamic code execution is not allowed' },
    { pattern: /eval\s*\(/, message: 'Dynamic code evaluation is not allowed' },
    { pattern: /open\s*\(/, message: 'File operations may be restricted' },
    { pattern: /while\s+True\s*:/, message: 'Infinite loops should be avoided' },
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
            message: `Missing opening bracket for '${char}'`
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
        message: `Missing closing bracket for '${bracket}'`
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
