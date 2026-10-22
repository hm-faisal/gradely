import { toast } from "@/components/ui/toast";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/login.action";
import { loginSchema } from "../schemas/login.schema";

export const useLogin = () => {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
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

	return { form };
};
