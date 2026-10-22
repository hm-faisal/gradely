import { cn } from "cn";
import { CircleAlert, CircleCheck } from "lucide-react";

type AuthMessageProps = {
  status: "success" | "error";
  message: string;
};

export function AuthMessage({ status, message }: AuthMessageProps) {
  const Icon = status === "success" ? CircleCheck : CircleAlert;

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        status === "success"
          ? "border-primary/25 bg-primary/5 text-foreground"
          : "border-destructive/30 bg-destructive/5 text-destructive",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
