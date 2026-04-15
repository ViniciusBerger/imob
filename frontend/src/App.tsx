import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';

export default function App() {
    return (
        // provides auth context through whole app
        <AuthProvider>
            {/* render UI for routes passed through router  */}
            <RouterProvider router={router} />
        </AuthProvider>
    );
}
