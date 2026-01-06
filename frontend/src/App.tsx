import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
