import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../css/AIEvaluate.css';
import documentService from '../services/documentService';
import evaluationService from '../services/evaluationService';
import authService from '../services/authService';

export default function AIEvaluate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [dragActive, setDragActive] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // TestEvaluation state
  const [documentId, setDocumentId] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState(null);

  useEffect(() => {
    loadDocuments();
    fetchHistory();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await documentService.getUserDocuments();
      setDocuments(response. documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await evaluationService.getUserEvaluations();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleRunEvaluation = async () => {
    setLoading(true);
    setErrorObj(null);
    setCurrentResult(null);
    try {
      const data = await evaluationService.evaluateDocument(documentId);
      setCurrentResult(data);
      fetchHistory();
    } catch (err) {
      const rawMsg = err.message || "Unknown error";
      if (rawMsg.includes("TYPE:")) {
        const [type, msg] = rawMsg.replace("TYPE:", "").split("|");
        setErrorObj({ type, message: msg });
      } else {
        setErrorObj({ type: 'UNKNOWN', message: rawMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetEvaluation = async (idToFetch) => {
    setLoading(true);
    setErrorObj(null);
    setCurrentResult(null);
    try {
      const id = idToFetch || documentId;
      const data = await evaluationService.getEvaluation(id);
      setCurrentResult(data);
    } catch (err) {
      setErrorObj({ type: 'FETCH_ERROR', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getErrorStyle = (type) => {
    switch (type) {
      case 'RATE_LIMIT': return { bg: '#fff7ed', border: '#f97316', color: '#c2410c', icon: '⏳' };
      case 'DUPLICATE': return { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', icon: 'ℹ️' };
      case 'SERVER_ERROR': return { bg: '#fef2f2', border: '#ef4444', color: '#b91c1c', icon: '💥' };
      default: return { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: '⚠️' };
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e. stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e. target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploadError('');
    setUploadSuccess('');

    if (!file) {
      setUploadError('Please select a file');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml. document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      const response = await documentService.uploadDocument(file);
      setUploadSuccess(`Document "${file.name}" uploaded successfully!`);
      await loadDocuments();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error) {
      setUploadError(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleLink = () => {
    alert('Google Drive integration coming soon!');
  };

  const handleDeleteDocument = async (documentId, filename) => {
    if (! window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }
    try {
      await documentService.deleteDocument(documentId);
      setUploadSuccess(`Document "${filename}" deleted successfully!`);
      await loadDocuments();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      setUploadError(error.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math. log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date. toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') return '📄';
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '📝';
    if (fileType === 'text/plain') return '📃';
    return '📎';
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="ai-evaluate-container">
      <Sidebar />

      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Pages</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">AI Evaluate</span>
          </div>
          <h1 className="page-title">AI Evaluate</h1>
        </div>

        {/* Success/Error Messages */}
        {uploadError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {uploadError}
            <button className="alert-close" onClick={() => setUploadError('')}>×</button>
          </div>
        )}
        {uploadSuccess && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {uploadSuccess}
            <button className="alert-close" onClick={() => setUploadSuccess('')}>×</button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon black">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Documents</div>
              <div className="stat-value">{documents.length}</div>
              <div className="stat-change positive">+{documents.length} uploaded</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-. 656.126-1.283. 356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Evaluations</div>
              <div className="stat-value">{history.length}</div>
              <div className="stat-change positive">+{history.length} completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">
                {history.length > 0 
                  ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || 0), 0) / history.length)
                  : 0}
              </div>
              <div className="stat-change positive">Overall average</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Analysis</div>
              <div className="stat-value">{history.length}</div>
              <div className="stat-change positive">All time</div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="section-title">Upload Testing Documentation</h2>
          <div className="upload-tabs">
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 16a4 4 0 01-. 88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload File
            </button>
            <button 
              className={`tab-btn ${activeTab === 'google' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('google');
                handleGoogleLink();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13. 828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-. 758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Google Link
            </button>
          </div>

          <div 
            className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115. 9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="drop-text">
              {uploading ? 'Uploading...' : 'Drop your testing documentation here'}
            </p>
            <p className="drop-subtext">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
            <input 
              type="file" 
              id="file-input" 
              accept=".pdf,.docx,. txt" 
              onChange={handleFileInput}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <button 
              className="select-file-btn"
              onClick={() => document.getElementById('file-input').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Select File'}
            </button>
          </div>
        </div>

        {/* Run New Evaluation Section */}
        <div className="upload-section">
          <h2 className="section-title">🚀 Run New Evaluation</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Document UUID
            </label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="e.g.  550e8400-e29b-41d4-a716-446655440000"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              onClick={handleRunEvaluation} 
              disabled={loading || ! documentId}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#3b82f6',
                color: 'white',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'Run Analysis (POST)'}
            </button>

            <button 
              onClick={() => handleGetEvaluation()} 
              disabled={loading || !documentId}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#e2e8f0',
                color: '#475569'
              }}
            >
              Get Result (GET)
            </button>
          </div>

          {/* ERROR DISPLAY */}
          {errorObj && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: getErrorStyle(errorObj.type). bg,
              border: `1px solid ${getErrorStyle(errorObj.type).border}`,
              color: getErrorStyle(errorObj. type).color,
              borderRadius: '6px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{fontSize: '1. 2rem'}}>{getErrorStyle(errorObj.type). icon}</span>
              <div>
                <strong style={{display: 'block', fontSize: '0.8rem', opacity: 0.8}}>
                  {errorObj.type. replace('_', ' ')} ERROR
                </strong>
                {errorObj.message}
              </div>
            </div>
          )}
        </div>

        {/* API Response Data */}
        {currentResult && (
          <div className="upload-section">
            <h2 className="section-title">🔍 API Response Data</h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1. 5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px dashed #cbd5e1'
            }}>
              <ScoreBadge label="Overall" score={currentResult.overallScore} />
              <ScoreBadge label="Completeness" score={currentResult.completenessScore} />
              <ScoreBadge label="Clarity" score={currentResult.clarityScore} />
              <ScoreBadge label="Consistency" score={currentResult.consistencyScore} />
              <ScoreBadge label="Verification" score={currentResult.verificationScore} />
            </div>
            <pre style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1rem',
              borderRadius: '8px',
              overflowX: 'auto',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(currentResult, null, 2)}
            </pre>
          </div>
        )}

        {/* My Uploads and History Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* My Uploads - Left Half */}
          <div className="my-uploads-section" style={{ marginBottom: 0 }}>
            <div className="section-header">
              <h2 className="section-title">My Uploads</h2>
              <button className="view-all-btn">
                View all
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="uploads-list">
              {loadingDocuments ?  (
                <p className="no-uploads">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="no-uploads">No uploads yet.  Start by uploading your first document. </p>
              ) : (
                <div className="documents-grid" style={{ gridTemplateColumns: '1fr' }}>
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                      <div className="document-icon-large">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="document-details">
                        <h3 className="document-filename">{doc.filename}</h3>
                        <p className="document-meta">
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadDate)}
                        </p>
                        <span className={`document-badge status-${doc.status?. toLowerCase()}`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="document-actions">
                        <button 
                          className="action-btn"
                          onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                          title="Delete"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 7l-. 867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* History - Right Half */}
          <div className="my-uploads-section" style={{ marginBottom: 0 }}>
            <div className="section-header">
              <h2 className="section-title">📜 History (Module 9)</h2>
              <button 
                onClick={fetchHistory} 
                className="view-all-btn"
                style={{ cursor: 'pointer' }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {history.length === 0 ? (
                <p className="no-uploads">No evaluations found. </p>
              ) : (
                history.map((evalItem) => (
                  <div 
                    key={evalItem. id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                        {evalItem.filename || 'Unknown File'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Score: <strong>{evalItem.overallScore}</strong> • {new Date(evalItem.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleGetEvaluation(evalItem. documentId)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      View JSON
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for score bubbles
const ScoreBadge = ({ label, score }) => (
  <div style={{
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    background: '#f8fafc', 
    padding: '10px', 
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    minWidth: '80px'
  }}>
    <span style={{fontSize: '20px', fontWeight: 'bold', color: score > 70 ? '#10b981' : '#f59e0b'}}>
      {score}
    </span>
    <span style={{fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
      {label}
    </span>
  </div>
);