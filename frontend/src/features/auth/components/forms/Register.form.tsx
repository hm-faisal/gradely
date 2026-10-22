"use client";

import { InputField } from "@/components/forms/input.form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useRegister } from "../../hooks/useRegister.hook";

export const RegisterForm = () => {
	const { form } = useRegister();

	return (
		<div className="flex flex-col gap-5">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<InputField
						form={form}
						name="name"
						label="Full name"
						placeholder="Jon Doe"
						autoComplete="name"
					/>

					<InputField
						form={form}
						name="email"
						label="Email"
						placeholder="jon@example.com"
						autoComplete="email"
					/>

					<InputField
						form={form}
						name="password"
						label="Password"
						type="password"
						placeholder="********"
						autoComplete="new-password"
					/>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button disabled={isSubmitting} type="submit">
								{isSubmitting ? (
									<>
										<Spinner /> creating account
									</>
								) : (
									"Create account"
								)}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
};
