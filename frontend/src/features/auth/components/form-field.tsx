import { cn } from "cn";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  /** Must match the `id` of the control rendered as `children`. */
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Optional content rendered next to the label, such as a "Forgot password?" link. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  action,
  className,
  children,
}: FormFieldProps) {
  return (
    <div data-slot="form-field" className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
