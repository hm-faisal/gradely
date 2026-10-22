"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { LoginForm } from "./forms/Login.form";
import { RegisterForm } from "./forms/Register.form";

type AuthMode = "login" | "register";

export function AuthCard() {
	const [mode, setMode] = useState<AuthMode>("login");
	const isLogin = mode === "login";

	return (
		<Card className="w-full max-w-md border-border/70 shadow-xl shadow-foreground/5">
			<CardHeader>
				<div className="mb-1 flex items-center gap-2 text-sm font-semibold tracking-tight lg:hidden">
					<span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<GraduationCap className="size-4" aria-hidden="true" />
					</span>
					Gradely
				</div>
				<CardTitle className="text-2xl font-semibold tracking-tight">
					{isLogin ? "Welcome back" : "Create your account"}
				</CardTitle>
				<CardDescription>
					{isLogin
						? "Sign in to continue to your dashboard."
						: "Start grading and learning in a matter of seconds."}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Tabs
					value={mode}
					onValueChange={(value) => {
						if (value === "login" || value === "register") setMode(value);
					}}
				>
					<TabsList className="w-full">
						<TabsTrigger value="login">Login</TabsTrigger>
						<TabsTrigger value="register">Register</TabsTrigger>
					</TabsList>

					<TabsContent value="login" keepMounted className="pt-4">
						<LoginForm />
					</TabsContent>

					<TabsContent value="register" keepMounted className="pt-4">
						<RegisterForm />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
