import { useForm } from "@tanstack/react-form";
import { useId, useState } from "react";
import { registerAction } from "../actions";
import type { Feedback } from "../types";

export const useRegister = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    onSubmit: async ({ value }) => {
      setFeedback(null);

      const result = await registerAction({
        name: value.name,
        email: value.email,
        password: value.password,
      });

      if (!result.success) {
        setFeedback({ status: "error", message: result.message });
        return;
      }

      setFeedback({
        status: "success",
        message: `Your account is ready, ${result.user.name.split(" ")[0]}! You are now signed in.`,
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
