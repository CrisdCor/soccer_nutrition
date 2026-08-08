import { z } from "zod";

// Sin z.coerce/.transform()/.default(): el tipo de entrada y salida de zod
// deben ser idénticos para que zodResolver + useForm (un solo genérico)
// tipen bien. La coerción (string->number, ""->null, default de booleano)
// se hace explícitamente en las server actions, después de parsear.
export const playerFormSchema = z.object({
  document: z.string().trim().min(1, "El documento es obligatorio.").max(50),
  full_name: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
  birth_date: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  sex: z.enum(["Hombre", "Mujer"], { message: "Selecciona el sexo." }),
  race_id: z.string().min(1, "Selecciona la raza."),
  position_id: z.string().optional(),
  category_id: z.string().optional(),
  home_club: z.boolean().optional(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
