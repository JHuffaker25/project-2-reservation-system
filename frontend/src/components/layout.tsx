import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { Outlet } from 'react-router'

export default function Layout() {
    return (
        <div>
            <div className="relative w-full">
            <Navbar />
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    )
}