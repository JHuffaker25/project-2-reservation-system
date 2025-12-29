import { Navigate, useLocation } from "react-router-dom"
import Layout from "./layout"
import { useAppSelector } from "@/app/hooks"
import type { User } from "@/types/types"
;

export function ProtectedLayout( { requires }: { requires: string } ) {
    const location = useLocation();

    const { isAuthenticated, user } = useAppSelector( ( state ) => state.auth );

    if (!isAuthenticated) {
        // Pass the current location in state so Signin can redirect back after login
        return <Navigate to="/signin" replace state={{ from: location }} />
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