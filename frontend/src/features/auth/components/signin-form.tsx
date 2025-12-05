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

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
            <form>
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
                    <Button variant="outline" type="button">
                    Sign in with Google
                    </Button>
                    <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link to='/signup'>Sign up</Link>
                    </FieldDescription>
                </Field>
                </FieldGroup>
            </form>
            </CardContent>
        </Card>
        </div>
    )
}
