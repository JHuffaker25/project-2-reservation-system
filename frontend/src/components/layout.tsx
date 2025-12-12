import { Navbar } from '@/components/ui/shadcn-io/navbar-01';
import { Outlet } from 'react-router';
import Loader from '@/components/loader';

export default function Layout({ loading }: { loading?: boolean }) {
    return (
        <div>
            <div className="relative w-full">
            <Navbar />
            </div>
            <main>
                {loading ? <Loader /> : <Outlet />}
            </main>
        </div>
    )
}