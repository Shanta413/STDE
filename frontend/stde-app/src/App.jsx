import { Routes, Route, Navigate } from "react-router-dom";

// NEW Auth Pages
import LandingPage from "./pages/LandingPage";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherRegister from "./pages/TeacherRegister";

// Existing Pages (keep these imports from your current project)
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Profile from "./pages/Profile";
import Classroom from "./pages/Classroom";
import TeacherClassroom from "./pages/TeacherClassroom";
import ClassroomDetails from './pages/ClassroomDetails';
import OAuthCallback from "./pages/OAuthCallback";
import TeacherProfile from "./pages/TeacherProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <Routes>
      {/* ===== LANDING PAGE - Role Selection ===== */}
      <Route path="/" element={<LandingPage />} />
      
      {/* ===== OAuth Callback ===== */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* ===== STUDENT AUTH ===== */}
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/register/student" element={<StudentRegister />} />

      {/* ===== TEACHER AUTH ===== */}
      <Route path="/login/teacher" element={<TeacherLogin />} />
      <Route path="/register/teacher" element={<TeacherRegister />} />

      {/* ===== ADMIN AUTH (Hidden - accessible via direct URL) ===== */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ===== PASSWORD RESET ===== */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ===== LEGACY REDIRECTS ===== */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* ===== STUDENT PROTECTED ROUTES ===== */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/classrooms"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Classroom />
          </ProtectedRoute>
        }
      />

      {/* ===== TEACHER PROTECTED ROUTES ===== */}
      <Route
        path="/teacher/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classrooms"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherClassroom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      {/* ===== SHARED ROUTES ===== */}
      <Route path="/classroom/:id" element={<ClassroomDetails />} />

      {/* ===== 404 ===== */}
      <Route path="*" element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
}
