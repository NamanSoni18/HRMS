import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import './PeerRating.css';

const PeerRating = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get current month and year
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await usersAPI.getForPeerRating();
            if (data.success && data.users) {
                // Filter out current user (can't rate themselves)
                const otherEmployees = data.users
                    .filter(emp => emp._id !== user?.id && emp.username !== user?.username)
                    .map(emp => ({
                        id: emp._id,
                        name: emp.profile?.firstName 
                            ? `${emp.profile.gender === 'Male' ? 'Mr.' : 'Mrs.'} ${emp.profile.firstName} ${emp.profile.lastName || ''}`
                            : emp.username,
                        designation: emp.employment?.designation || emp.role,
                        responsiveness: '',
                        teamSpirit: ''
                    }));
                setEmployees(otherEmployees);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalScore = (emp) => {
        const r = parseFloat(emp.responsiveness) || 0;
        const t = parseFloat(emp.teamSpirit) || 0;
        return r + t;
    };

    const handleScoreChange = (id, field, value) => {
        // Validate input (0-10)
        let numValue = value === "" ? "" : parseFloat(value);
        if (numValue !== "" && (numValue < 0 || numValue > 10)) return;

        setEmployees(employees.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        
        const tableRows = employees.map((emp, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="name-cell">
                    <div class="emp-name">${emp.name}</div>
                    <div class="emp-designation">${emp.designation}</div>
                </td>
                <td>${emp.responsiveness || ''}</td>
                <td>${emp.teamSpirit || ''}</td>
                <td>${calculateTotalScore(emp)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Peer Rating - NITRRFIE</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 14px;
                        line-height: 1.5;
                        color: #000;
                        background: #fff;
                        padding: 40px 50px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .header h2 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .rating-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 40px;
                    }
                    .rating-table th,
                    .rating-table td {
                        border: 1px solid #000;
                        padding: 12px 10px;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .rating-table th {
                        background: #f5f5f5;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    .name-cell {
                        text-align: center;
                    }
                    .emp-name {
                        font-weight: 600;
                        margin-bottom: 2px;
                    }
                    .emp-designation {
                        font-size: 12px;
                        color: #555;
                    }
                    .signature-section {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 60px;
                        padding-right: 30px;
                    }
                    .signature {
                        text-align: center;
                        font-weight: bold;
                    }
                    .signature p {
                        margin: 0;
                        line-height: 1.6;
                    }
                    @media print {
                        body {
                            padding: 20px 30px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>NIT Raipur Foundation for Innovation & Entrepreneurship (NITRR-FIE)</h1>
                    <h2>Peer Rating of Colleagues for the Month ${currentMonth} ${currentYear}</h2>
                </div>
                
                <table class="rating-table">
                    <thead>
                        <tr>
                            <th>S. No.</th>
                            <th>Name</th>
                            <th>Responsiveness<br/>(Out of 10)</th>
                            <th>Team Spirit<br/>(Out of 10)</th>
                            <th>Total Score<br/>(Out of 20)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="signature-section">
                    <div class="signature">
                        <p>Accountant Cum Administrator</p>
                        <p>NITRR-FIE</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    if (loading) {
        return (
            <div className="peer-rating-container">
                <div className="loading">Loading employees...</div>
            </div>
        );
    }

    return (
        <div className="peer-rating-container">
            <div className="rating-header">
                <h2>NIT Raipur Foundation for Innovation & Entrepreneurship (NITRR-FIE)</h2>
                <h3>Peer Rating of Colleagues for the Month {currentMonth} {currentYear}</h3>
            </div>

            <div className="table-container">
                <table className="rating-table">
                    <thead>
                        <tr>
                            <th>S. No.</th>
                            <th>Name</th>
                            <th>Responsiveness (Out of 10)</th>
                            <th>Team Spirit (Out of 10)</th>
                            <th>Total Score (Out of 20)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">No other employees to rate</td>
                            </tr>
                        ) : (
                            employees.map((emp, index) => {
                                const totalScore = calculateTotalScore(emp);

                                return (
                                    <tr key={emp.id}>
                                        <td>{index + 1}</td>
                                        <td className="name-cell">
                                            <div className="emp-name">{emp.name}</div>
                                            <div className="emp-designation">{emp.designation}</div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="score-input"
                                                value={emp.responsiveness}
                                                onChange={(e) => handleScoreChange(emp.id, 'responsiveness', e.target.value)}
                                                max="10"
                                                min="0"
                                                placeholder="0-10"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="score-input"
                                                value={emp.teamSpirit}
                                                onChange={(e) => handleScoreChange(emp.id, 'teamSpirit', e.target.value)}
                                                max="10"
                                                min="0"
                                                placeholder="0-10"
                                            />
                                        </td>
                                        <td className="total-score">{totalScore}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rating-footer">
                <div className="signature-section">
                    <div className="signature">
                        <p>Accountant Cum Administrator</p>
                        <p>NITRR-FIE</p>
                    </div>
                </div>
                
                <div className="download-section">
                    <button className="download-btn" onClick={handleDownloadPDF}>
                        <Download size={18} />
                        Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PeerRating;
