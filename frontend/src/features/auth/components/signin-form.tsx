import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router"
import { useAppDispatch } from "@/app/hooks"
import { login } from "../authSlice"

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const dispatch = useAppDispatch();

    const googleLoginUri = import.meta.env.VITE_GOOGLE_LOGIN_URI;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        dispatch(login({
            email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
            password: (event.currentTarget.elements.namedItem("password") as HTMLInputElement).value,
        }));
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
            <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
                Enter your email below to sign in to your account
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="username"
                    required
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                        Forgot your password?
                    </a>
                    </div>
                    <Input id="password" type="password" autoComplete="current-password" required />
                </Field>
                <Field>
                    <Button type="submit">Sign in</Button>
                    <Button variant="outline" type="button" onClick={() => window.location.href = googleLoginUri}>
                        Sign in with Google
                    </Button>
                    <FieldDescription className="text-center">
                    Don't have an account? <Link to='/signup'>Sign up</Link>
                    </FieldDescription>
                </Field>
                </FieldGroup>
            </form>
            </CardContent>
        </Card>
        </div>
    )
}
