import { z } from 'zod';

// Password validation schema with minimum requirements
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

// Email validation schema
export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .trim()
  .toLowerCase();

// Login form validation schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

// Signup form validation schema
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1, { message: 'First name is required' }),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }),
});

// Helper function to sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

// Function to validate and sanitize form inputs
export const validateAndSanitizeForm = <T>(
  schema: z.ZodType<T>,
  formData: Record<string, string>
): { isValid: boolean; data?: T; errors?: Record<string, string> } => {
  // Sanitize all inputs first
  const sanitizedData = Object.entries(formData).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === 'string' ? sanitizeInput(value) : value,
    }),
    {}
  );

  // Validate using schema
  const result = schema.safeParse(sanitizedData);

  if (result.success) {
    return { isValid: true, data: result.data };
  } else {
    // Extract error messages
    const errors = result.error.issues.reduce(
      (acc, err) => ({
        ...acc,
        [err.path[0]]: err.message,
      }),
      {} as Record<string, string>
    );
    return { isValid: false, errors };
  }
};