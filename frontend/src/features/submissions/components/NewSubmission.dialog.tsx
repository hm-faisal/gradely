"use client";

import { cn } from "cn";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismiss,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { CreateSubmissionField } from "../types";
import { useNewSubmission } from "../hooks/useNewSubmission.hook";

const FIELD_IDS: Record<CreateSubmissionField, string> = {
  projectName: "submission-project-name",
  repoUrl: "submission-repo-url",
  liveLink: "submission-live-link",
  description: "submission-description",
};

type SubmissionFormProps = {
  onCancel: () => void;
  onCreated: () => void;
};

const SubmissionForm = ({ onCancel, onCreated }: SubmissionFormProps) => {
  const { state, formAction, isPending, values, handleChange, fieldError } =
    useNewSubmission({ onCreated });

  return (
    <form action={formAction} className="grid gap-4">
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor={FIELD_IDS.projectName}>Project name</Label>
        <Input
          id={FIELD_IDS.projectName}
          name="projectName"
          placeholder="Portfolio website"
          autoComplete="off"
          required
          minLength={3}
          maxLength={255}
          value={values.projectName}
          onChange={handleChange("projectName")}
          aria-invalid={Boolean(fieldError("projectName"))}
          disabled={isPending}
        />
        {fieldError("projectName") ? (
          <p className="text-xs text-destructive">
            {fieldError("projectName")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={FIELD_IDS.repoUrl}>Repository URL</Label>
          <Input
            id={FIELD_IDS.repoUrl}
            name="repoUrl"
            type="url"
            placeholder="https://github.com/you/project"
            required
            value={values.repoUrl}
            onChange={handleChange("repoUrl")}
            aria-invalid={Boolean(fieldError("repoUrl"))}
            disabled={isPending}
          />
          {fieldError("repoUrl") ? (
            <p className="text-xs text-destructive">{fieldError("repoUrl")}</p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={FIELD_IDS.liveLink}>Live link</Label>
          <Input
            id={FIELD_IDS.liveLink}
            name="liveLink"
            type="url"
            placeholder="https://your-project.com"
            required
            value={values.liveLink}
            onChange={handleChange("liveLink")}
            aria-invalid={Boolean(fieldError("liveLink"))}
            disabled={isPending}
          />
          {fieldError("liveLink") ? (
            <p className="text-xs text-destructive">{fieldError("liveLink")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={FIELD_IDS.description}>Description</Label>
        <Textarea
          id={FIELD_IDS.description}
          name="description"
          placeholder="What did you build, and what should the reviewer know?"
          required
          minLength={10}
          maxLength={5000}
          value={values.description}
          onChange={handleChange("description")}
          aria-invalid={Boolean(fieldError("description"))}
          disabled={isPending}
        />
        {fieldError("description") ? (
          <p className="text-xs text-destructive">
            {fieldError("description")}
          </p>
        ) : null}
      </div>

      <DialogFooter className="pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner />
              Creating…
            </>
          ) : (
            <>
              <Plus aria-hidden="true" />
              Create submission
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

type NewSubmissionDialogProps = {
  className?: string;
};

export const NewSubmissionDialog = ({
  className,
}: NewSubmissionDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleCreated = useCallback(() => setOpen(false), []);
  const handleCancel = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className={cn("gap-1.5", className)}
        onClick={() => setOpen(true)}
      >
        <Plus aria-hidden="true" />
        <span className="hidden sm:inline">New submission</span>
        <span className="sr-only sm:hidden">New submission</span>
      </Button>

      <DialogContent>
        <DialogDismiss />

        <DialogHeader>
          <DialogTitle>New submission</DialogTitle>
          <DialogDescription>
            Share your project with the Gradely team. You can edit it until a
            reviewer picks it up.
          </DialogDescription>
        </DialogHeader>

        <SubmissionForm onCancel={handleCancel} onCreated={handleCreated} />
      </DialogContent>
    </Dialog>
  );
};
