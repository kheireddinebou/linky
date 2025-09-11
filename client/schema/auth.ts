import * as yup from "yup";

const emailSchema = yup
  .string()
  .email("Invalid email")
  .required("Email is required");
const passwordSchema = yup
  .string()
  .min(6, "Password must be at least 6 characters")
  .required("Password is required");

export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  first_name: yup.string().optional(),
  last_name: yup.string().optional(),
});
