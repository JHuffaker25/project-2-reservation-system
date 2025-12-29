import { Route, Routes } from 'react-router'
import { lazy, Suspense, useEffect } from 'react';
import { useCsrfToken } from './app/useCsrfToken'
import { useSyncThemeWithUser } from './app/useSyncThemeWithUser'
import { useLazyGetUserDataQuery } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { login, setUserSessionData } from '@/features/auth/authSlice';
import Layout from './components/layout'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Rooms from './pages/Rooms'
import Reservations from './pages/Reservations'
import ViewTransactions from './pages/ViewTransactions'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ManageReservations from './pages/ManageReservations'
import UpdateRooms from './pages/UpdateRooms'
import BookReservation from './pages/BookReservation'
import { ProtectedLayout } from './components/protected-layout'
import { Navigate } from 'react-router';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);
const GoogleAuthCallback = lazy(() => import('@/features/auth/components/GoogleAuthCallback'));

function App() {
    useCsrfToken()
    useSyncThemeWithUser()
    const [fetchUser] = useLazyGetUserDataQuery();
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function checkSession() {
            try {
                const user = await fetchUser().unwrap();
                dispatch(login({ email: user.email }));
                dispatch(setUserSessionData(user));
            } catch {
                // Not logged in or session expired; do nothing
            }
        }
        checkSession();
        // eslint-disable-next-line
    }, []);
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/rooms" element={<Rooms />} />
            </Route>

            {/* Google OAuth callback route */}
            <Route path="/auth/callback" element={
                <Suspense fallback={<div>Loading...</div>}>
                    <GoogleAuthCallback />
                </Suspense>
            } />

            <Route element={<ProtectedLayout requires="CUSTOMER" />}>
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/profile" element={
                    <Elements stripe={stripePromise}>
                        <Profile />
                    </Elements>
                } />
                <Route path="/rooms/:id/book" element={<BookReservation />} />
            </Route>

            <Route element={<ProtectedLayout requires="admin" />}>
                <Route path="/view-transactions" element={<ViewTransactions />} />
                <Route path="/manage-reservations" element={<ManageReservations />} />
                <Route path="/update-rooms" element={<UpdateRooms />} />
            </Route>

            <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
    )
}

export default App
