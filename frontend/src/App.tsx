import { Route, Routes } from 'react-router'
import Login from './pages/Login'

function App() {

    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Nested routes */}
            {/* <Route path="/dashboard" element={<Dashboard />}>
                <Route path="profile" element={<div>Profile</div>} />
                <Route path="settings" element={<div>Settings</div>} />
            </Route> */}

            {/* 404 fallback */}
            {/* <Route path="*" element={<div>Not Found</div>} /> */}
        </Routes>
    )
}

export default App
