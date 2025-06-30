import React, { useState } from 'react';
import { Users, UserCheck, Package, BarChart3, Settings, LogOut } from 'lucide-react';
import { TailorManagement } from './TailorManagement';
import { SalesStaffManagement } from './SalesStaffManagement';
import { OrderWorkflowManagement } from './OrderWorkflowManagement';
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { useAuth } from '../../hooks/useAuth';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('tailors');
  const { logout } = useAuth();

  const tabs = [
    { id: 'tailors', label: 'Tailor Management', icon: Users },
    { id: 'sales', label: 'Sales Staff', icon: UserCheck },
    { id: 'workflow', label: 'Order Workflow', icon: Package },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tailors':
        return <TailorManagement />;
      case 'sales':
        return <SalesStaffManagement />;
      case 'workflow':
        return <OrderWorkflowManagement />;
      case 'analytics':
        return <PerformanceAnalytics />;
      case 'settings':
        return <div className="p-6">Settings content coming soon...</div>;
      default:
        return <TailorManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage stakeholders and monitor performance</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow mr-8">
            <nav className="p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}