import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'
import Button from './components/common/Button';


function App() {
  const { logout, isAuthenticated } = useAuth(); 

  return (
    <Router>
      <Toaster
          position="top-right" // Or your preferred position
          reverseOrder={false}
          toastOptions={{
            // Define default options
            duration: 5000, // Default duration 5 seconds
            style: {
              background: '#363636',
              color: '#fff',
            },
            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: 'green',
                color: 'white',
              },
            },
             error: {
              duration: 5000,
              style: {
                background: 'red',
                color: 'white',
              },
            },
          }}
        />
      <div>
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4 items-center">
            <li><Link to="/">Home</Link></li>
            {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
            {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
            {isAuthenticated && <li><Link to="/dashboard">Dashboard</Link></li>}
            {isAuthenticated && (
                <li>
                    <Button
                    type='submit'
                    onClick={logout}
                    variant='danger'
                    size='sm'> Logout </Button>
                </li>
            )}
          </ul>
        </nav>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const HomePage = () => (
  <div className="text-center mt-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to TaskFlow</h1>
        <p className="text-lg text-gray-600">Your simple and effective task management tool.</p>
        <div className="mt-8">
             <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2">
                Get Started
            </Link>
             <Link to="/login" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Login
            </Link>
        </div>
    </div>
);

export default App;