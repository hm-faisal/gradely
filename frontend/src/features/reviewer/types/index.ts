export type ReviewField = "status" | "feedback";

export type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ReviewField, string>>;
};
