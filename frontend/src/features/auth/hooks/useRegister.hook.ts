import { toast } from "@/components/ui/toast";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { registerAction } from "../actions/register.action";
import { registerSchema } from "../schemas/register.schema";

export const useRegister = () => {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: registerSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await registerAction({
				name: value.name,
				email: value.email,
				password: value.password,
			});

			if (!result.success) {
				toast.add({
					title: "Registration failure",
					description:
						result.message || "Something went wrong. Please try again",
					type: "error",
				});
				return;
			}

			router.push("/me");
			toast.add({
				title: "Registration Success",
				description: `Welcome, ${result.user.name}!`,
				type: "success",
			});
		},
	});

	return { form };
};
