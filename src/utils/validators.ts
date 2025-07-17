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

// Tournament validation schemas
export const tournamentSchema = z.object({
  name: z.string().trim().min(1, { message: 'Tournament name is required' }).max(100, { message: 'Tournament name must be less than 100 characters' }),
  description: z.string().trim().max(500, { message: 'Description must be less than 500 characters' }).optional(),
  gameType: z.enum(['stroke', 'match', 'stableford'], { message: 'Invalid game type' }),
  maxPlayers: z.number().int().min(2, { message: 'Minimum 2 players required' }).max(32, { message: 'Maximum 32 players allowed' }),
  entryFee: z.number().min(0, { message: 'Entry fee cannot be negative' }).max(10000, { message: 'Entry fee too high' }),
  startTime: z.string().refine((date) => new Date(date) > new Date(), { message: 'Start time must be in the future' }),
});

// Player validation schema
export const playerSchema = z.object({
  name: z.string().trim().min(1, { message: 'Player name is required' }).max(50, { message: 'Player name must be less than 50 characters' }),
  email: emailSchema,
  handicapIndex: z.number().min(-5, { message: 'Handicap too low' }).max(54, { message: 'Handicap too high' }),
});

// Press bet validation schema
export const pressBetSchema = z.object({
  betType: z.enum(['closest_to_pin', 'longest_drive', 'birdie_bet', 'eagle_bet'], { message: 'Invalid bet type' }),
  amount: z.number().min(1, { message: 'Minimum bet amount is $1' }).max(1000, { message: 'Maximum bet amount is $1000' }),
  description: z.string().trim().max(200, { message: 'Description must be less than 200 characters' }).optional(),
  holeNumber: z.number().int().min(1, { message: 'Invalid hole number' }).max(18, { message: 'Invalid hole number' }).optional(),
});

// Course validation schema
export const courseSchema = z.object({
  name: z.string().trim().min(1, { message: 'Course name is required' }).max(100, { message: 'Course name must be less than 100 characters' }),
  location: z.string().trim().max(200, { message: 'Location must be less than 200 characters' }).optional(),
  par: z.number().int().min(54, { message: 'Par too low' }).max(108, { message: 'Par too high' }),
  rating: z.number().min(50, { message: 'Rating too low' }).max(85, { message: 'Rating too high' }).optional(),
  slope: z.number().int().min(55, { message: 'Slope too low' }).max(155, { message: 'Slope too high' }).optional(),
});

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().trim().min(1, { message: 'First name is required' }).max(50, { message: 'First name must be less than 50 characters' }),
  lastName: z.string().trim().min(1, { message: 'Last name is required' }).max(50, { message: 'Last name must be less than 50 characters' }),
  phone: z.string().trim().regex(/^\+?[\d\s\-\(\)\.]+$/, { message: 'Invalid phone number format' }).max(20, { message: 'Phone number too long' }).optional(),
  handicap: z.number().min(-5, { message: 'Handicap too low' }).max(54, { message: 'Handicap too high' }).optional(),
  homeCourse: z.string().trim().max(100, { message: 'Home course name must be less than 100 characters' }).optional(),
});

// Helper function to sanitize input (enhanced)
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/&/g, '&amp;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
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