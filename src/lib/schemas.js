// src/lib/schemas.js
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(4, "Full name must be at least 4 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    phone: z
      .string()
      .refine(
        (val) => val === "" || /^[6-9]\d{9}$/.test(val),
        "Invalid phone number (10 digits starting with 6-9)"
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Alternative: If you want international format (E.164)
export const registerSchemaInternational = z
  .object({
    name: z.string().min(4, "Full name must be at least 4 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || val === "" || /^\+?[1-9]\d{1,14}$/.test(val),
        "Invalid phone number (E.164 format)"
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
