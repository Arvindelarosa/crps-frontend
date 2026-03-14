import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore, useUiStore } from '../../store';

const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useUiStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '68px' : '260px' }}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F6F9] p-6">
          <div className="max-w-7xl mx-auto animate-fade-in w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
