export type AdminFormState = {
  data?: Record<string, unknown>;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  submissionKey?: number;
  status: "idle" | "success" | "error";
};

export const initialAdminFormState: AdminFormState = {
  status: "idle",
};