import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Building2, Factory, Eye, RefreshCw, AlertCircle, FileText, Users, Calendar, MessageSquare } from 'lucide-react';
import { api, type BulkOrderInquiry, type StitchingPartnership } from '../../lib/supabase';
import PartnershipDocumentsTab from './components/PartnershipDocumentsTab';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('bulk-orders');
  const [bulkOrderInquiries, setBulkOrderInquiries] = useState<BulkOrderInquiry[]>([]);
  const [stitchingPartnerships, setStitchingPartnerships] = useState<StitchingPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    // Test connection first
    testConnectionAndFetchData();
  }, [navigate]);

  const testConnectionAndFetchData = async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      console.log('Testing database connection...');
      const connectionTest = await api.testConnection();
      console.log('Connection test result:', connectionTest);
      
      if (!connectionTest.success) {
        setConnectionError('Database connection failed. Please check your Supabase configuration.');
        return;
      }
      
      await fetchData();
    } catch (error) {
      console.error('Error during connection test:', error);
      setConnectionError('Failed to connect to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      
      // Fetch both datasets
      const [bulkOrderData, stitchingData] = await Promise.all([
        api.getBulkOrderInquiries(),
        api.getStitchingPartnerships()
      ]);
      
      console.log('Fetched data:', {
        bulkOrders: bulkOrderData?.length || 0,
        partnerships: stitchingData?.length || 0
      });
      
      setBulkOrderInquiries(bulkOrderData || []);
      setStitchingPartnerships(stitchingData || []);
      
      // Log the actual data for debugging
      if (bulkOrderData && bulkOrderData.length > 0) {
        console.log('Sample bulk order:', bulkOrderData[0]);
      }
      if (stitchingData && stitchingData.length > 0) {
        console.log('Sample partnership:', stitchingData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionError('Failed to fetch data from database.');
      setBulkOrderInquiries([]);
      setStitchingPartnerships([]);
    }
  };

  const updateStatus = async (type: string, id: string, status: string) => {
    setUpdating(id);
    try {
      console.log(`Updating ${type} ${id} to status: ${status}`);
      await api.updateStatus(type, id, status);
      
      // Update local state immediately for better UX
      if (type === 'bulk-order') {
        setBulkOrderInquiries(prev => 
          prev.map(item => item.id === id ? { ...item, status } : item)
        );
      } else {
        setStitchingPartnerships(prev => 
          prev.map(item => item.id === id ? { ...item, status } : item)
        );
      }
      
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'documents_requested': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'documents_submitted': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'documents_approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'credentials_sent': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
          <p className="text-sm text-gray-500 mt-2">Testing database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <button
                onClick={testConnectionAndFetchData}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Database Connection Error</p>
              <p className="text-red-700 text-sm">{connectionError}</p>
            </div>
            <button
              onClick={testConnectionAndFetchData}
              className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bulk Order Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{bulkOrderInquiries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Factory className="w-8 h-8 text-secondary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partnership Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stitchingPartnerships.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stitchingPartnerships.filter(p => p.status === 'documents_requested').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stitchingPartnerships.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('bulk-orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === 'bulk-orders'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-primary-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Bulk Orders ({bulkOrderInquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stitching-partnerships')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === 'stitching-partnerships'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-primary-50'
            }`}
          >
            <Factory className="w-5 h-5" />
            <span>Partnerships ({stitchingPartnerships.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('document-review')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === 'document-review'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-primary-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Document Review</span>
          </button>
        </div>

        {/* Document Review Tab */}
        {activeTab === 'document-review' && (
          <PartnershipDocumentsTab />
        )}

        {/* Bulk Orders Table */}
        {activeTab === 'bulk-orders' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Order Inquiries</h2>
            </div>
            {bulkOrderInquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bulk order inquiries found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {connectionError ? 'Database connection issue.' : 'Try refreshing or check if data exists in database.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkOrderInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inquiry.company_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{inquiry.contact_person}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                          <div className="text-sm text-gray-500">{inquiry.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{inquiry.product_category}</div>
                          <div className="text-sm text-gray-500">{inquiry.order_quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(inquiry.submission_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={inquiry.status}
                            onChange={(e) => updateStatus('bulk-order', inquiry.id, e.target.value)}
                            disabled={updating === inquiry.id}
                            className={`text-xs px-3 py-2 rounded-full font-medium border cursor-pointer transition-all duration-200 ${getStatusColor(inquiry.status)} ${
                              updating === inquiry.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                            }`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {updating === inquiry.id && (
                            <div className="mt-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(inquiry)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Partnerships Table */}
        {activeTab === 'stitching-partnerships' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Partnership Applications</h2>
            </div>
            {stitchingPartnerships.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Factory className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No partnership applications found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {connectionError ? 'Database connection issue.' : 'Try refreshing or check if data exists in database.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stitchingPartnerships.map((partnership) => (
                      <tr key={partnership.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{partnership.unit_name}</div>
                          <div className="text-sm text-gray-500">{partnership.owner_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{partnership.email}</div>
                          <div className="text-sm text-gray-500">{partnership.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{partnership.city}, {partnership.state}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(partnership.submission_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={partnership.status}
                            onChange={(e) => updateStatus('stitching-partnership', partnership.id, e.target.value)}
                            disabled={updating === partnership.id}
                            className={`text-xs px-3 py-2 rounded-full font-medium border cursor-pointer transition-all duration-200 ${getStatusColor(partnership.status)} ${
                              updating === partnership.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                            }`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="documents_requested">Documents Requested</option>
                            <option value="documents_submitted">Documents Submitted</option>
                            <option value="documents_approved">Documents Approved</option>
                            <option value="credentials_sent">Credentials Sent</option>
                            <option value="active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {updating === partnership.id && (
                            <div className="mt-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(partnership)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedItem.company_name || selectedItem.unit_name} - Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(selectedItem)
                  .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900 break-words">
                          {value ? String(value) : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;