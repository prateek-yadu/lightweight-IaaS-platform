import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Outlet } from 'react-router';

export default function Layout() {
    return (
        <>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <Toaster position='top-center' duration={1500}/> {/* sonner toast */}
            <Outlet />
        </ThemeProvider>
        </>
    );
}
