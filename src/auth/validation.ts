import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

export const loginSchema = z.object({
  email: z.string().trim().min(1).email().max(255),
  password: z.string().min(1).max(128),
});

export const registerSchema = z
  .object({
    email: z.string().trim().min(1).email().max(255),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(128),
    confirmPassword: z.string().min(1).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>;

export function validateLogin(input: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  const parsed = loginSchema.safeParse(input);
  if (parsed.success) return errors;
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (field === "email") errors.email = "auth.invalidEmail";
    if (field === "password") errors.password = "auth.passwordRequired";
  }
  return errors;
}

export function validateRegister(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const parsed = registerSchema.safeParse(input);
  if (parsed.success) return errors;
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (field === "email") errors.email = "auth.invalidEmail";
    if (field === "password") errors.password = "auth.passwordTooShort";
    if (field === "confirmPassword") errors.confirmPassword = "auth.passwordMismatch";
  }
  return errors;
}
