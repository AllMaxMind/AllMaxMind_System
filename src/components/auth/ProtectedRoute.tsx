/**
 * Protected Route Component
 * Story: SPRINT-1-P4 (Admin Access)
 *
 * Wraps routes to enforce authentication and role-based access
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin' | 'user';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole = 'user',
  fallback = null
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  // Show loading state while auth is loading
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-ds-bg">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-ds-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ds-bg gap-4">
        <h1 className="text-2xl font-bold text-white">Authentication Required</h1>
        <p className="text-ds-text-tertiary">Please sign in to access this page</p>
      </div>
    );
  }

  // Check role permissions
  if (requiredRole && requiredRole !== 'user') {
    const currentRole = userRole || 'user';
    const hasRequiredRole = (requiredRole === 'admin' && ['admin', 'super_admin'].includes(currentRole)) ||
                           (requiredRole === 'super_admin' && currentRole === 'super_admin');

    if (!hasRequiredRole) {
      console.warn(`Access denied: User role '${currentRole}' cannot access ${requiredRole} routes`);
      return fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-ds-bg gap-4">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-ds-text-tertiary">You don't have permission to access this page</p>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

/**
 * Admin-only route wrapper
 * Usage: <AdminRoute>{<AdminComponent />}</AdminRoute>
 */
export function AdminRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Super-admin-only route wrapper
 */
export function SuperAdminRoute({ children, fallback }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="super_admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
