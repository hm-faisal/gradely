import { useForm } from "@tanstack/react-form";
import { useId, useState } from "react";
import { loginAction } from "../actions";
import type { Feedback } from "../types";

export const useLogin = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    onSubmit: async ({ value }) => {
      setFeedback(null);

      const result = await loginAction({
        email: value.email,
        password: value.password,
      });

      if (!result.success) {
        setFeedback({ status: "error", message: result.message });
        return;
      }

      setFeedback({
        status: "success",
        message: `Welcome back, ${result.user.name.split(" ")[0]}! You are now signed in.`,
      });
      form.reset();
    },
  });

  return {
    form,
    fieldId,
    formId,
    feedback,
  };
};
