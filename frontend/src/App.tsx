import { Route, Routes } from 'react-router'
import { useCsrfToken } from './app/useCsrfToken'
import { useSyncThemeWithUser } from './app/useSyncThemeWithUser'
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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function App() {
    useCsrfToken()
    useSyncThemeWithUser()
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/rooms" element={<Rooms />} />
            </Route>


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
