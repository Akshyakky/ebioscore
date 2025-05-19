import { useForm, UseFormProps, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType, ZodTypeDef } from "zod";

/**
 * A custom hook that extends React Hook Form with Zod validation.
 *
 * @param schema The Zod schema to validate the form values against
 * @param options Additional options to pass to useForm
 * @returns The extended form methods from React Hook Form
 */
export function useZodForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TSchema extends ZodType<any, ZodTypeDef, any> = ZodType<any, ZodTypeDef, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<TFieldValues, TContext>, "resolver">
): UseFormReturn<TFieldValues, TContext> {
  return useForm<TFieldValues, TContext>({
    ...options,
    resolver: zodResolver(schema),
    mode: options?.mode || "onBlur",
  });
}
