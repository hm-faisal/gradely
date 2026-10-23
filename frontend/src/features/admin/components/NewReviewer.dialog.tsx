"use client";

import { cn } from "cn";
import { Plus, UserPlus } from "lucide-react";
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
import { useNewReviewer } from "../hooks/useNewReviewer.hook";

type NewReviewerDialogProps = {
  className?: string;
};

export const NewReviewerDialog = ({ className }: NewReviewerDialogProps) => {
  const { open, setOpen, state, formAction, isPending, fieldError } =
    useNewReviewer();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className={cn("gap-1.5", className)}
        onClick={() => setOpen(true)}
      >
        <Plus aria-hidden="true" />
        <span className="hidden sm:inline">Add reviewer</span>
        <span className="sr-only sm:hidden">Add reviewer</span>
      </Button>

      <DialogContent>
        <DialogDismiss />

        <DialogHeader>
          <DialogTitle>Add reviewer</DialogTitle>
          <DialogDescription>
            Create a reviewer account. Reviewers can review pending submissions.
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="reviewer-name">Full name</Label>
            <Input
              id="reviewer-name"
              name="name"
              placeholder="Ada Lovelace"
              autoComplete="name"
              required
              minLength={2}
              maxLength={255}
              disabled={isPending}
              aria-invalid={Boolean(fieldError("name"))}
            />
            {fieldError("name") ? (
              <p className="text-xs text-destructive">{fieldError("name")}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reviewer-email">Email</Label>
            <Input
              id="reviewer-email"
              name="email"
              type="email"
              placeholder="reviewer@example.com"
              autoComplete="email"
              required
              maxLength={254}
              disabled={isPending}
              aria-invalid={Boolean(fieldError("email"))}
            />
            {fieldError("email") ? (
              <p className="text-xs text-destructive">{fieldError("email")}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reviewer-password">Temporary password</Label>
            <Input
              id="reviewer-password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              disabled={isPending}
              aria-invalid={Boolean(fieldError("password"))}
            />
            {fieldError("password") ? (
              <p className="text-xs text-destructive">
                {fieldError("password")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use uppercase, lowercase, a number, and a special character.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
                  <UserPlus aria-hidden="true" />
                  Create reviewer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
