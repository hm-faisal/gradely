"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type AnyFormApi, useField } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import { type ComponentProps, useState } from "react";

type InputFieldProps = Omit<
	ComponentProps<typeof Input>,
	"id" | "name" | "value" | "onChange" | "onBlur" | "aria-invalid" | "form"
> & {
	form: AnyFormApi;
	name: string;
	label: string;
};

export const InputField = ({
	form,
	name,
	label,
	type = "text",
	...inputProps
}: InputFieldProps) => {
	const field = useField({ form, name });
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";
	const isInvalid =
		field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<div className={isPassword ? "relative" : undefined}>
				<Input
					id={field.name}
					name={field.name}
					type={isPassword && showPassword ? "text" : type}
					value={field.state.value as string}
					onChange={(event) => field.handleChange(event.target.value)}
					onBlur={field.handleBlur}
					aria-invalid={isInvalid}
					{...inputProps}
				/>
				{isPassword && (
					<button
						className="absolute top-1/2 right-3 -translate-y-1/2"
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeClosed className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				)}
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
