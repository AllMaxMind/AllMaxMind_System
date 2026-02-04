/**
 * Admin Page
 * Story: SPRINT-1-P4 (Admin Access)
 *
 * Protected admin dashboard page that displays the lead pipeline
 * Only accessible to users with 'admin' or 'super_admin' role
 */

import React from 'react';
import { AdminRoute } from '../components/auth/ProtectedRoute';
import { LeadDashboard } from '../components/admin/LeadDashboard';

export function AdminPage() {
  return (
    <AdminRoute>
      <LeadDashboard />
    </AdminRoute>
  );
}

export default AdminPage;
