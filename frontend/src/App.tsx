import { Route, Routes } from 'react-router'
import Layout from './components/layout'
import Login from './pages/Login'

function App() {

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
            </Route>
        </Routes>
    )
}

export default App
