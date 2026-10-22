"use client";

import { InputField } from "@/components/forms/input.form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "../../hooks/useLogin.hook";

export const LoginForm = () => {
	const { form } = useLogin();

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
						name="email"
						label="Email"
						autoComplete="off"
					/>

					<InputField
						form={form}
						name="password"
						label="Password"
						type="password"
						autoComplete="off"
					/>

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
