import { Route, Routes } from 'react-router'
import Layout from './components/layout'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Rooms from './pages/Rooms'
import Reservations from './pages/Reservations'
import Transactions from './pages/Transactions'
import LandingPage from './pages/LandingPage'
import Profile from './pages/Profile'
import ManageReservations from './pages/ManageReservations'
import ManageRooms from './pages/ManageRooms'

function App() {

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/manage-reservations" element={<ManageReservations />} />
                <Route path="/manage-rooms" element={<ManageRooms />} />
                <Route path="/profile" element={<Profile />} />
            </Route>
        </Routes>
    )
}

export default App
