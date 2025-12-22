import { Navigate } from "react-router"
import Layout from "./layout"
import { useAppSelector } from "@/app/hooks"
import type { User } from "@/features/auth/authSlice"
;

export function ProtectedLayout( { requires }: { requires: string } ) {

    const { isAuthenticated, user } = useAppSelector( ( state ) => state.auth );

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />
    }

    // Function to compare user role with required permissions
    const roleAuthorized = (user: User | null, requiredPermissions: string) => {
        if (!user || !user.role) {
            return false;
        } else if (!requiredPermissions) {
            return true;
        }

        switch (user.role) {
            case 'ADMIN':
                return true;
            case 'CUSTOMER':
                return requiredPermissions !== 'ADMIN';
            default:
                return false;
        }
    }

    if (roleAuthorized(user, requires)) {
        return (
            <Layout />
        );
    } else if (!user) {
        return 
    } else {
        return <Navigate to="/signin" replace />
    }

}