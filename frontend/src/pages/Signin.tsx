
import { useLocation } from "react-router-dom";
import { SigninForm } from "../features/auth/components/signin-form";

function Signin() {
    const location = useLocation();
    // @ts-ignore
    const from = location.state?.from?.pathname || "/rooms";
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SigninForm redirectTo={from} />
            </div>
        </div>
    )
}

export default Signin;