import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForumsPage from './pages/ForumsPage';
import ThreadPage from './pages/ThreadPage';
import CopilotPage from './pages/CopilotPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="forums" element={<ForumsPage />} />
                <Route path="forums/:forumId" element={<ForumsPage />} />
                <Route path="threads/:threadId" element={<ThreadPage />} />
                <Route
                    path="copilot"
                    element={
                        <ProtectedRoute>
                            <CopilotPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="resources" element={<ResourcesPage />} />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
