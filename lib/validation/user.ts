import { z } from "zod";

export const createUserFormSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Correo inválido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
  full_name: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
  role: z.enum(["admin", "nutricionista", "lider"], { message: "Selecciona el rol." }),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const editUserFormSchema = z.object({
  full_name: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
  role: z.enum(["admin", "nutricionista", "lider"], { message: "Selecciona el rol." }),
});

export type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres."),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
