import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, ROLES, RESPONDER_ROLES } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'

import RoleSelect from './pages/auth/RoleSelect'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import GeneralHome from './pages/general/Home'
import HelpRequest from './pages/general/HelpRequest'
import Donate from './pages/general/Donate'
import DonationResult from './pages/general/DonationResult'
import Feedback from './pages/general/Feedback'
import AdminDashboard from './pages/admin/Dashboard'
import SendAlert from './pages/admin/SendAlert'
import ReliefManage from './pages/admin/ReliefManage'
import FundManage from './pages/admin/FundManage'
import AdminRequests from './pages/admin/AdminRequests'
import AdminFeedback from './pages/admin/AdminFeedback'
import ResponderHome from './pages/responder/Home'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="container">Loading...</div>
  if (!user) return <Navigate to="/select-role" replace />
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />
  if (RESPONDER_ROLES.includes(user.role)) return <Navigate to="/responder" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/select-role" element={<RoleSelect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute roles={[ROLES.GENERAL]}>
            <GeneralHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/help-request"
        element={
          <ProtectedRoute roles={[ROLES.GENERAL]}>
            <HelpRequest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donate"
        element={
          <ProtectedRoute roles={[ROLES.GENERAL, ROLES.NGO]}>
            <Donate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donate/result"
        element={
          <ProtectedRoute roles={[ROLES.GENERAL, ROLES.NGO]}>
            <DonationResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedback"
        element={
          <ProtectedRoute roles={[ROLES.GENERAL]}>
            <Feedback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/send-alert"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <SendAlert />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminFeedback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relief"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.RESCUE_TEAM, ROLES.NGO]}>
            <ReliefManage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/funds/manage"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.RESCUE_TEAM]}>
            <FundManage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/responder/*"
        element={
          <ProtectedRoute roles={RESPONDER_ROLES}>
            <ResponderHome />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}