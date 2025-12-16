import { Route, Routes } from 'react-router'
import Layout from './components/layout'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Rooms from './pages/Rooms'
import Reservations from './pages/Reservations'
import ViewTransactions from './pages/ViewTransactions'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import ManageReservations from './pages/ManageReservations'
import UpdateRooms from './pages/UpdateRooms'
import BookReservation from './pages/BookReservation'
import { ProtectedLayout } from './components/protected-layout'
import { useEffect } from 'react'
import { useAppDispatch } from './app/hooks'
import { loginSuccess, startAuth } from './features/auth/authSlice'

function App() {

    const dispatch = useAppDispatch();

    const fakeUser = {
        id: "69406ff27b0ba5176cd88e5e",
        email: "test@test.com",
        name: "Test User",
        role: "user",
        preferences: {
            emailNotifications: true,
            darkMode: false,
        }
    };

    useEffect(() => {
        dispatch(startAuth());

        // const timeout = setTimeout(() => {
            //  dispatch(loginSuccess(fakeUser));
            // dispatch(setAuthResolved());
        // }, 500);

        dispatch(loginSuccess(fakeUser))
        // return () => clearTimeout(timeout);
    }, [dispatch]);

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id/book" element={<BookReservation />} />
            </Route>

            <Route element={<ProtectedLayout requires="user" />}>
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/profile" element={<Profile />} />
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
