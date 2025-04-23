import { z } from "zod";

// Validation schema using Zod
export const employeeSchema = z
  .object({
    // Personal Information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    age: z.number().positive("Age must be positive").int("Age must be an integer").optional().nullable(),
    gender: z.string().min(1, "Gender is required"),

    // Employment Information
    employeeId: z.string().optional(),
    department: z.string().min(1, "Department is required"),
    position: z.string().min(1, "Position is required"),
    roles: z.array(z.string()).min(1, "At least one role is required"),
    skills: z.array(z.string()).optional(),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),

    // Additional Information
    joinDate: z.any().refine((val) => val !== null, "Join date is required"),
    contractEndDate: z.any().optional().nullable(),
    salary: z.number().positive("Salary must be positive").optional().nullable(),
    profileImage: z.any().optional().nullable(),

    // Preferences & Agreements
    notificationPreferences: z.array(z.string()).optional(),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Define form data interface based on Zod schema for better type inference
export type EmployeeFormData = z.infer<typeof employeeSchema>;

// Option type for select fields
export interface OptionType {
  value: string;
  label: string;
}

// Form section props interface
export interface FormSectionProps {
  control: any;
  errors?: Record<string, any>;
}
