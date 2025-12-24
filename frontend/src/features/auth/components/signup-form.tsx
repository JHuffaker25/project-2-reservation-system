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
import { useState } from "react"
import { useCreateUserMutation } from "../authApi"
import { useAppDispatch } from "@/app/hooks"
import { login, setUserSessionData } from "../authSlice"
import { useLazyGetUserDataQuery } from "../authApi"
import { setCredentials, clearCredentials } from "@/features/auth/authMemory"
import { useNavigate } from "react-router"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const [createUser, { isLoading }] = useCreateUserMutation()
    const [apiError, setApiError] = useState("")
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [fetchUser] = useLazyGetUserDataQuery()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  function validate() {
    const newErrors: { [key: string]: string } = {}
    if (!form.firstName.trim()) newErrors.firstName = "First name is required."
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required."
    if (!form.phone.trim()) newErrors.phone = "Phone number is required."
    else if (!/^\d{10,}$/.test(form.phone.replace(/\D/g, ""))) newErrors.phone = "Enter a valid phone number."
    if (!form.email.trim()) newErrors.email = "Email is required."
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address."
    if (!form.password) newErrors.password = "Password is required."
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters."
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password."
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match."
    return newErrors
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const keyMap: { [key: string]: string } = {
      "first-name": "firstName",
      "last-name": "lastName",
      "phone": "phone",
      "email": "email",
      "password": "password",
      "confirm-password": "confirmPassword"
    }
    const key = keyMap[e.target.id] || e.target.id
    setForm({ ...form, [key]: e.target.value })
    setErrors({ ...errors, [key]: "" })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError("")
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      createUser({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: "CUSTOMER",
      })
        .unwrap()
        .then(async () => {
          try {
            setCredentials(form.email, form.password)
            const user = await fetchUser().unwrap()
            dispatch(login({ email: form.email }))
            dispatch(setUserSessionData(user))
            navigate("/rooms")
          } catch {
            clearCredentials()
            setApiError("Account created, but login failed.")
          }
        })
        .catch((err: any) => {
          setApiError(err?.data?.message || "Signup failed. Please try again.")
        })
    }
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Success message handled by navigation */}
        {apiError && (
          <div className="text-red-600 mb-2">{apiError}</div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-4">
              <Field className="gap-2">
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input id="first-name" type="text" placeholder="John" value={form.firstName} onChange={handleChange} required aria-invalid={!!errors.firstName} />
                {errors.firstName && <FieldDescription className="text-red-500">{errors.firstName}</FieldDescription>}
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input id="last-name" type="text" placeholder="Doe" value={form.lastName} onChange={handleChange} required aria-invalid={!!errors.lastName} />
                {errors.lastName && <FieldDescription className="text-red-500">{errors.lastName}</FieldDescription>}
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input id="phone" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={handleChange} required aria-invalid={!!errors.phone} />
                {errors.phone && <FieldDescription className="text-red-500">{errors.phone}</FieldDescription>}
              </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={form.email}
                onChange={handleChange}
                required
                aria-invalid={!!errors.email}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
              {errors.email && <FieldDescription className="text-red-500">{errors.email}</FieldDescription>}
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" value={form.password} onChange={handleChange} required aria-invalid={!!errors.password} />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {errors.password && <FieldDescription className="text-red-500">{errors.password}</FieldDescription>}
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" value={form.confirmPassword} onChange={handleChange} required aria-invalid={!!errors.confirmPassword} />
              <FieldDescription>Please confirm your password.</FieldDescription>
              {errors.confirmPassword && <FieldDescription className="text-red-500">{errors.confirmPassword}</FieldDescription>}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
                <Button variant="outline" type="button" className="cursor-pointer">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/signin" className="cursor-pointer">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
