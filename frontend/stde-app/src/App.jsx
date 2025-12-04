import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import AIEvaluate from "./pages/AIEvaluate";
import Profile from "./pages/Profile";
import TestEvaluation from "./pages/TestEvaluation";
import Classroom from "./pages/Classroom"; // ✅ NEW PAGE IMPORT

// Components
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route 
        path="/ai-evaluate" 
        element={
          <ProtectedRoute>
            <AIEvaluate />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* ✅ NEW: Classroom Page */}
      <Route 
        path="/classroom" 
        element={
          <ProtectedRoute>
            <Classroom />
          </ProtectedRoute>
        }
      />

      {/* Dev Test Page (not protected) */}
      <Route path="/test-eval" element={<TestEvaluation />} />

      {/* 404 */}
      <Route path="*" element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
}
