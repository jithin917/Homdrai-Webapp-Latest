import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download,
  Eye,
  Clock,
  User,
  Calendar,
  Shield,
  History,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { api, type PartnerDocument, type DocumentVersion, type DocumentViewLog } from '../../../lib/supabase';

interface DocumentViewerModalProps {
  document: PartnerDocument;
  partnershipData: any;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  partnershipData,
  isOpen,
  onClose
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [viewLogs, setViewLogs] = useState<DocumentViewLog[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    if (isOpen && document.id) {
      fetchDocumentData();
    }
  }, [isOpen, document.id]);

  const fetchDocumentData = async () => {
    try {
      setLoading(true);
      
      // Fetch document versions and view logs in parallel
      const [versionsData, viewLogsData] = await Promise.all([
        api.getDocumentVersions(document.id),
        api.getDocumentViewLogs(document.id)
      ]);
      
      setVersions(versionsData);
      setViewLogs(viewLogsData);
      
      // Set current version as selected by default
      const currentVersion = versionsData.find(v => v.is_current_version) || versionsData[0];
      setSelectedVersion(currentVersion);
      
    } catch (error) {
      console.error('Error fetching document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAccessToken = async (versionId?: string) => {
    try {
      setGeneratingToken(true);
      const result = await api.generateDocumentAccessToken(
        document.id, 
        versionId, 
        'Document Review'
      );
      
      if (result.success) {
        setAccessToken(result.token);
      } else {
        alert('Failed to generate access token');
      }
    } catch (error) {
      console.error('Error generating access token:', error);
      alert('Error generating access token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleViewDocument = async (version: DocumentVersion) => {
    try {
      // Log the document view
      await api.logDocumentView(
        document.id,
        version.id,
        'admin',
        'Admin User', // In production, get from auth context
        'direct'
      );
      
      // Open document in new tab
      window.open(version.document_url, '_blank');
      
      // Refresh view logs
      const updatedLogs = await api.getDocumentViewLogs(document.id);
      setViewLogs(updatedLogs);
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadReasonColor = (reason: string) => {
    switch (reason) {
      case 'initial_submission':
        return 'bg-blue-100 text-blue-800';
      case 'revision_requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'voluntary_update':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-primary-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Document Viewer</h2>
                <p className="text-gray-600">{document.document_name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>Partnership: {partnershipData.unit_name}</span>
                  <span>•</span>
                  <span>Type: {document.document_type.replace('_', ' ').toUpperCase()}</span>
                  {document.is_locked && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Shield className="w-4 h-4" />
                        <span>Locked</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading document data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Versions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Document Versions ({versions.length})</span>
                  </h3>
                  
                  {versions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No versions found.</p>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((version) => (
                        <div 
                          key={version.id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedVersion?.id === version.id 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                Version {version.version_number}
                              </span>
                              {version.is_current_version && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Current
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${getUploadReasonColor(version.upload_reason)}`}>
                                {version.upload_reason.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDocument(version);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                title="View Document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={version.document_url}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Uploaded by:</span>
                              <span className="ml-1">{version.uploaded_by}</span>
                            </div>
                            <div>
                              <span className="font-medium">Size:</span>
                              <span className="ml-1">
                                {version.file_size ? formatFileSize(version.file_size) : 'Unknown'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Upload Date:</span>
                              <span className="ml-1">
                                {new Date(version.upload_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>
                              <span className="ml-1">{version.mime_type || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Version Details */}
                {selectedVersion && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Version {selectedVersion.version_number} Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={selectedVersion.document_url}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => handleViewDocument(selectedVersion)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secure Access Token
                        </label>
                        <div className="flex items-center space-x-2">
                          {accessToken ? (
                            <input
                              type="text"
                              value={accessToken}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                            />
                          ) : (
                            <button
                              onClick={() => handleGenerateAccessToken(selectedVersion.id)}
                              disabled={generatingToken}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                            >
                              {generatingToken ? 'Generating...' : 'Generate Token'}
                            </button>
                          )}
                        </div>
                        {accessToken && (
                          <p className="text-xs text-gray-500 mt-1">
                            Token expires in 24 hours and allows 10 accesses
                          </p>
                        )}
                      </div>
                    </div>

                    {document.is_locked && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 text-orange-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Document Locked</span>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                          This document has been approved and is locked to prevent unauthorized changes. 
                          Contact the partner if revisions are needed.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* View Logs Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>View History</span>
                  </h3>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {viewLogs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No views recorded yet.</p>
                    ) : (
                      viewLogs.map((log) => (
                        <div key={log.id} className="border border-gray-200 rounded p-2 text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="w-3 h-3 text-gray-500" />
                            <span className="font-medium">{log.viewer_name}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              log.viewer_type === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {log.viewer_type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {new Date(log.view_timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="text-xs">({log.access_method})</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Document Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Document Statistics</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Versions:</span>
                      <span className="font-medium">{document.total_versions || versions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Views:</span>
                      <span className="font-medium">{document.view_count || viewLogs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Viewed:</span>
                      <span className="font-medium">
                        {document.last_viewed_at 
                          ? new Date(document.last_viewed_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        document.admin_review_status === 'approved' 
                          ? 'text-green-600' 
                          : document.admin_review_status === 'rejected'
                          ? 'text-red-600'
                          : document.admin_review_status === 'needs_revision'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`}>
                        {document.admin_review_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;