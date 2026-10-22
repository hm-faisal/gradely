"use client";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "../../actions/login.action";
import { loginSchema } from "../../schemas/login.schema";

export const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "superadmin@gmail.com",
			password: "Super@admin12345",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await loginAction({
				email: value.email,
				password: value.password,
			});

			if (!result.success) {
				toast.add({
					title: "Authorization failure",
					description:
						result.message || "Something went wrong. Please try again",
					type: "error",
				});
				return;
			}

			toast.add({
				title: "Login Success",
				description: `Welcome back, ${result.user.name}!`,
				type: "success",
			});
			router.push("/me");
		},
	});

	return (
		<div className="flex flex-col gap-5">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field name="email">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										value={field.state.value}
										autoComplete="off"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="password">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<div className="relative">
										<Input
											id={field.name}
											name={field.name}
											type={showPassword ? "text" : "password"}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											value={field.state.value}
											autoComplete="off"
											aria-invalid={isInvalid}
										/>
										<button
											className="absolute right-3 top-1/2 -translate-y-1/2"
											type="button"
											onClick={() => setShowPassword((prev) => !prev)}
										>
											{showPassword ? (
												<EyeClosed className="size-4" />
											) : (
												<Eye className="size-4" />
											)}
										</button>
									</div>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button disabled={isSubmitting} type="submit">
								{isSubmitting ? (
									<>
										<Spinner /> submitting
									</>
								) : (
									"Submit"
								)}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
};
