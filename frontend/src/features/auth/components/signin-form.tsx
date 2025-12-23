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
import { Link, useNavigate } from "react-router"
import { useAppDispatch } from "@/app/hooks"
import { login, setUserSessionData } from "../authSlice"
import { useLazyGetUserDataQuery } from "../authApi"
import { useState } from "react"
import Loader from "@/components/loader"
import { setCredentials, clearCredentials } from "@/features/auth/authMemory";

export function SigninForm({
  className,
  redirectTo = "/rooms",
  ...props
}: React.ComponentProps<"div"> & { redirectTo?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const googleLoginUri = import.meta.env.VITE_GOOGLE_LOGIN_URI;


  // Local state for form fields and error
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Query for user data after login (will be triggered after successful login mutation)
  const [fetchUser, { isLoading }] = useLazyGetUserDataQuery();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // store credentials in memory
      setCredentials(email, password);

      const user = await fetchUser().unwrap();
      dispatch(login({ email }));
      dispatch(setUserSessionData(user));
      navigate(redirectTo);
    } catch {
      clearCredentials();
      setError("Invalid email or password");
    }
  }

  if (isLoading) return <Loader />;

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
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </Field>
              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}
              <Field>
                <Button type="submit" className="cursor-pointer">Sign in</Button>
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
  );
}
