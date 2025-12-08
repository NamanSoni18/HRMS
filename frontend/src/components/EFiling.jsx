import { useState, useEffect, useRef } from 'react';
import { 
    Send, Inbox, Clock, History, Upload, FileText, User, Download, 
    Check, CheckCheck, Search, Filter, X, Paperclip, ChevronDown,
    File, Image, FileSpreadsheet, Presentation, Archive, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { efilingAPI, usersAPI } from '../services/api';
import './EFiling.css';

const EFiling = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('send');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [inbox, setInbox] = useState([]);
    const [sent, setSent] = useState([]);
    const [history, setHistory] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [historyFilter, setHistoryFilter] = useState('');
    
    // Send form state
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [note, setNote] = useState('');
    const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchEmployees();
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (activeTab === 'inbox') fetchInbox();
        else if (activeTab === 'sent') fetchSent();
        else if (activeTab === 'history') fetchHistory();
    }, [activeTab, historyFilter]);

    const fetchEmployees = async () => {
        try {
            const data = await usersAPI.getForPeerRating();
            if (data.success) {
                const others = data.users.filter(emp => 
                    emp._id !== user?.id && emp.username !== user?.username
                );
                setEmployees(others);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await efilingAPI.getUnreadCount();
            if (data.success) setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchInbox = async () => {
        setLoading(true);
        try {
            const data = await efilingAPI.getInbox();
            if (data.success) {
                setInbox(data.transfers);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSent = async () => {
        setLoading(true);
        try {
            const data = await efilingAPI.getSent();
            if (data.success) setSent(data.transfers);
        } catch (error) {
            console.error('Failed to fetch sent:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await efilingAPI.getHistory(1, historyFilter);
            if (data.success) setHistory(data.transfers);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                alert('File size must be less than 25MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSend = async () => {
        if (!selectedFile) return alert('Please select a file');
        if (!selectedRecipient) return alert('Please select a recipient');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('recipientId', selectedRecipient);
            formData.append('note', note);

            const data = await efilingAPI.sendFile(formData);
            if (data.success) {
                alert('File sent successfully!');
                setSelectedFile(null);
                setSelectedRecipient('');
                setNote('');
                setRecipientSearch('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                alert(data.message || 'Failed to send file');
            }
        } catch (error) {
            alert('Failed to send file');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (transfer) => {
        try {
            if (!transfer.isRead && transfer.recipient?._id === user?.id) {
                await efilingAPI.markAsRead(transfer._id);
                fetchInbox();
            }

            const response = await efilingAPI.downloadFile(transfer._id);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = transfer.originalName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert('Failed to download file');
            }
        } catch (error) {
            alert('Failed to download file');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await efilingAPI.markAsRead(id);
            fetchInbox();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getEmployeeName = (emp) => {
        if (emp?.profile?.firstName) return `${emp.profile.firstName} ${emp.profile.lastName || ''}`;
        return emp?.username || 'Unknown';
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('image')) return <Image size={20} className="file-icon image" />;
        if (fileType?.includes('pdf')) return <FileText size={20} className="file-icon pdf" />;
        if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet size={20} className="file-icon excel" />;
        if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return <Presentation size={20} className="file-icon ppt" />;
        if (fileType?.includes('zip') || fileType?.includes('rar')) return <Archive size={20} className="file-icon archive" />;
        return <File size={20} className="file-icon default" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredEmployees = employees.filter(emp => 
        getEmployeeName(emp).toLowerCase().includes(recipientSearch.toLowerCase())
    );

    const getSelectedRecipientName = () => {
        const emp = employees.find(e => e._id === selectedRecipient);
        return emp ? getEmployeeName(emp) : '';
    };

    const renderSendTab = () => (
        <div className="send-section">
            <div className="send-form">
                <h3>Send Document</h3>
                
                <div className="form-group">
                    <label>Select Recipient</label>
                    <div className="recipient-selector">
                        <div className="recipient-input" onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}>
                            <User size={18} />
                            <span className={selectedRecipient ? 'selected' : 'placeholder'}>
                                {selectedRecipient ? getSelectedRecipientName() : 'Choose recipient...'}
                            </span>
                            <ChevronDown size={18} />
                        </div>
                        {showRecipientDropdown && (
                            <div className="recipient-dropdown">
                                <div className="dropdown-search">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={recipientSearch}
                                        onChange={(e) => setRecipientSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="dropdown-list">
                                    {filteredEmployees.length === 0 ? (
                                        <div className="no-results">No employees found</div>
                                    ) : (
                                        filteredEmployees.map(emp => (
                                            <div
                                                key={emp._id}
                                                className={`dropdown-item ${selectedRecipient === emp._id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedRecipient(emp._id);
                                                    setShowRecipientDropdown(false);
                                                    setRecipientSearch('');
                                                }}
                                            >
                                                <div className="emp-avatar">{getEmployeeName(emp).charAt(0)}</div>
                                                <div className="emp-details">
                                                    <span className="emp-name">{getEmployeeName(emp)}</span>
                                                    <span className="emp-role">{emp.employment?.designation || emp.role}</span>
                                                </div>
                                                {selectedRecipient === emp._id && <Check size={16} />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Select File</label>
                    <div 
                        className={`file-upload-area ${selectedFile ? 'has-file' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                        {selectedFile ? (
                            <div className="selected-file">
                                {getFileIcon(selectedFile.type)}
                                <div className="file-info">
                                    <span className="file-name">{selectedFile.name}</span>
                                    <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                                </div>
                                <button className="remove-file" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={32} />
                                <span>Click to select file</span>
                                <span className="file-types">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images, ZIP (Max 25MB)</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Note (Optional)</label>
                    <textarea placeholder="Add a message or note..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                </div>

                <button className="send-btn" onClick={handleSend} disabled={loading || !selectedFile || !selectedRecipient}>
                    {loading ? <span>Sending...</span> : <><Send size={18} /> Send Document</>}
                </button>
            </div>
        </div>
    );

    const renderInboxTab = () => (
        <div className="inbox-section">
            {loading ? <div className="loading">Loading...</div> : inbox.length === 0 ? (
                <div className="empty-state">
                    <Inbox size={48} />
                    <h3>No files received</h3>
                    <p>Files sent to you will appear here</p>
                </div>
            ) : (
                <div className="file-list">
                    {inbox.map(transfer => (
                        <div key={transfer._id} className={`file-item ${!transfer.isRead ? 'unread' : ''}`}>
                            <div className="file-icon-wrapper">
                                {getFileIcon(transfer.fileType)}
                                {!transfer.isRead && <span className="unread-dot"></span>}
                            </div>
                            <div className="file-details">
                                <div className="file-header">
                                    <span className="file-name">{transfer.originalName}</span>
                                    <span className="file-size">{formatFileSize(transfer.fileSize)}</span>
                                </div>
                                <div className="file-meta">
                                    <span className="sender"><User size={14} /> From: {getEmployeeName(transfer.sender)}</span>
                                    <span className="date"><Clock size={14} /> {formatDateTime(transfer.createdAt)}</span>
                                </div>
                                {transfer.note && <div className="file-note"><Paperclip size={14} /> {transfer.note}</div>}
                            </div>
                            <div className="file-actions">
                                <button className="download-btn" onClick={() => handleDownload(transfer)} title="Download"><Download size={18} /></button>
                                {!transfer.isRead && <button className="mark-read-btn" onClick={() => handleMarkAsRead(transfer._id)} title="Mark as read"><Check size={18} /></button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSentTab = () => (
        <div className="sent-section">
            {loading ? <div className="loading">Loading...</div> : sent.length === 0 ? (
                <div className="empty-state">
                    <Send size={48} />
                    <h3>No files sent</h3>
                    <p>Files you send will appear here</p>
                </div>
            ) : (
                <div className="file-list">
                    {sent.map(transfer => (
                        <div key={transfer._id} className="file-item">
                            <div className="file-icon-wrapper">{getFileIcon(transfer.fileType)}</div>
                            <div className="file-details">
                                <div className="file-header">
                                    <span className="file-name">{transfer.originalName}</span>
                                    <span className="file-size">{formatFileSize(transfer.fileSize)}</span>
                                </div>
                                <div className="file-meta">
                                    <span className="recipient"><User size={14} /> To: {getEmployeeName(transfer.recipient)}</span>
                                    <span className="date"><Clock size={14} /> {formatDateTime(transfer.createdAt)}</span>
                                </div>
                                {transfer.note && <div className="file-note"><Paperclip size={14} /> {transfer.note}</div>}
                            </div>
                            <div className="file-status">
                                {transfer.isRead ? (
                                    <span className="status read"><CheckCheck size={16} /> Read</span>
                                ) : (
                                    <span className="status delivered"><Check size={16} /> Delivered</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderHistoryTab = () => (
        <div className="history-section">
            <div className="history-filters">
                <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
                    <option value="">All Transfers</option>
                    <option value="sent">Sent Only</option>
                    <option value="received">Received Only</option>
                </select>
            </div>
            
            {loading ? <div className="loading">Loading...</div> : history.length === 0 ? (
                <div className="empty-state">
                    <History size={48} />
                    <h3>No history</h3>
                    <p>Your file transfer history will appear here</p>
                </div>
            ) : (
                <div className="file-list history-list">
                    {history.map(transfer => {
                        const isSent = transfer.sender?._id === user?.id || transfer.sender?.username === user?.username;
                        return (
                            <div key={transfer._id} className={`file-item ${isSent ? 'sent' : 'received'}`}>
                                <div className="transfer-direction">
                                    <span className={`direction-badge ${isSent ? 'sent' : 'received'}`}>{isSent ? 'SENT' : 'RECEIVED'}</span>
                                </div>
                                <div className="file-icon-wrapper">{getFileIcon(transfer.fileType)}</div>
                                <div className="file-details">
                                    <div className="file-header">
                                        <span className="file-name">{transfer.originalName}</span>
                                        <span className="file-size">{formatFileSize(transfer.fileSize)}</span>
                                    </div>
                                    <div className="file-meta">
                                        <span className="person"><User size={14} /> {isSent ? `To: ${getEmployeeName(transfer.recipient)}` : `From: ${getEmployeeName(transfer.sender)}`}</span>
                                        <span className="date"><Clock size={14} /> {formatDateTime(transfer.createdAt)}</span>
                                    </div>
                                    {transfer.note && <div className="file-note"><Paperclip size={14} /> {transfer.note}</div>}
                                </div>
                                <div className="file-actions">
                                    <button className="download-btn" onClick={() => handleDownload(transfer)} title="Download"><Download size={18} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="efiling-container">
            <div className="efiling-header">
                <h2>E-Filing</h2>
                <p>Send and receive documents securely</p>
            </div>

            <div className="efiling-tabs">
                <button className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
                    <Send size={18} /> Send
                </button>
                <button className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
                    <Inbox size={18} /> Inbox
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
                <button className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
                    <Check size={18} /> Sent
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <History size={18} /> History
                </button>
            </div>

            <div className="efiling-content">
                {activeTab === 'send' && renderSendTab()}
                {activeTab === 'inbox' && renderInboxTab()}
                {activeTab === 'sent' && renderSentTab()}
                {activeTab === 'history' && renderHistoryTab()}
            </div>
        </div>
    );
};

export default EFiling;
