import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'
import { ProtectedRoute } from './components/auth/protected-route'
import { DashboardLayout } from './components/layout/dashboard-layout'
import { Toaster } from './components/ui/toaster'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'
import { UsersPage } from './pages/users'
import { CreateUserPage } from './pages/users/create'
import { UserDetailsPage } from './pages/users/details'
import { EditUserPage } from './pages/users/edit'
import { FitnessSessionsPage } from './pages/fitness-sessions'
import { UpcomingSessionsPage } from './pages/fitness-sessions/upcoming'
import { CreateSessionPage } from './pages/fitness-sessions/create'
import { EditSessionPage } from './pages/fitness-sessions/edit'
import { SessionDetailsPage } from './pages/fitness-sessions/detail'
import { AttendancePage } from './pages/attendance'
import { AttendanceDetailsPage } from './pages/attendance/detail'
import { DietPlansPage } from './pages/diet-plans'
import { CreateDietPlanPage } from './pages/diet-plans/create'
import { EditDietPlanPage } from './pages/diet-plans/edit'
import { DietPlanDetailPage } from './pages/diet-plans/detail'
import { BulkMessagePage } from './pages/bulk-message'


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />

              {/* Users Routes */}
              <Route path="users">
                <Route index element={<UsersPage />} />
                <Route path="create" element={<CreateUserPage />} />
                <Route path=":id" element={<UserDetailsPage />} />
                <Route path=":id/edit" element={<EditUserPage />} />
              </Route>

              {/* Fitness Sessions Routes */}
              <Route path="upcoming-sessions" element={<UpcomingSessionsPage />} />
              <Route path="fitness-sessions">
                <Route index element={<FitnessSessionsPage />} />
                <Route path="create" element={<CreateSessionPage />} />
                <Route path=":id" element={<SessionDetailsPage />} />
                <Route path=":id/edit" element={<EditSessionPage />} />
              </Route>

              <Route path="attendance" element={<AttendancePage />} />
              <Route path="attendance/:id" element={<AttendanceDetailsPage />} />

              {/* Diet Plans Routes */}
              <Route path="diet-plans">
                <Route index element={<DietPlansPage />} />
                <Route path="create" element={<CreateDietPlanPage />} />
                <Route path=":id" element={<DietPlanDetailPage />} />
                <Route path=":id/edit" element={<EditDietPlanPage />} />
              </Route>

              <Route path="bulk-message" element={<BulkMessagePage />} />

              {/* <Route path="orders" element={<OrdersPage />} />
              <Route path="settings" element={<SettingsPage />} /> */}
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
