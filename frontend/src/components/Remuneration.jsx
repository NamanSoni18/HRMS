import { useState, useRef } from 'react';
import './Remuneration.css';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Save } from 'lucide-react';

const Remuneration = () => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const contentRef = useRef(null);

    const isFacultyInCharge = user?.role === 'FACULTY_IN_CHARGE';

    // Current month and year
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    // Sample employee data - attendance columns left blank for current month
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: 'Mr. Medha Singh',
            designation: 'Chief Executive Officer',
            dateOfJoining: '15-07-2025',
            grossRemuneration: 80000,
            daysWorked: '',
            casualLeave: '',
            weeklyOff: '',
            holidays: '',
            lwpDays: '',
            totalDays: '',
            payableDays: '',
            fixedRemuneration: 64000.00,
            variableRemuneration: 16000.00,
            totalRemuneration: 80000.00,
            tds: 0.00,
            otherDeduction: 0.00,
            netPayable: 80000.00,
            panBankDetails: 'PAN: BHRPS4064A\nBANK: IDBI Bank,\nCivil Lines, Raipur\nA/C: 0495104000146716\nIFSC:IBKL0000495'
        },
        {
            id: 2,
            name: 'Mr. Sunil Dewangan',
            designation: 'Incubation Manager',
            dateOfJoining: '10/9/2025',
            grossRemuneration: 54000,
            daysWorked: '',
            casualLeave: '',
            weeklyOff: '',
            holidays: '',
            lwpDays: '',
            totalDays: '',
            payableDays: '',
            fixedRemuneration: 43200.00,
            variableRemuneration: 10800.00,
            totalRemuneration: 54000.00,
            tds: 0.00,
            otherDeduction: 0.00,
            netPayable: 54000.00,
            panBankDetails: 'PAN: BJZPD0141A\nBANK: State Bank of India,\nCamp Area Bhilai,\nNear Power House, Bhilai\nA/C: 38072524817\nIFSC: SBIN0009154'
        },
        {
            id: 3,
            name: 'Mr. Ashok Sahu',
            designation: 'Accountant Cum Administrator',
            dateOfJoining: '30/9/25',
            grossRemuneration: 32400,
            daysWorked: '',
            casualLeave: '',
            weeklyOff: '',
            holidays: '',
            lwpDays: '',
            totalDays: '',
            payableDays: '',
            fixedRemuneration: 25920.00,
            variableRemuneration: 6480.00,
            totalRemuneration: 32400.00,
            tds: 0.00,
            otherDeduction: 0.00,
            netPayable: 32400.00,
            panBankDetails: 'PAN: BCPPA5763A\nBANK: State Bank of India,\nTelibandha GE Road, Near\nRailway Crossing\nA/C: 30174860333\nIFSC: SBIN0005194'
        },
        {
            id: 4,
            name: 'Mr. Himanshu Verma',
            designation: 'Support Staff',
            dateOfJoining: '18/10/25',
            grossRemuneration: 10000,
            daysWorked: '',
            casualLeave: '',
            weeklyOff: '',
            holidays: '',
            lwpDays: '',
            totalDays: '',
            payableDays: '',
            fixedRemuneration: 8000.00,
            variableRemuneration: 2000.00,
            totalRemuneration: 10000.00,
            tds: 0.00,
            otherDeduction: 0.00,
            netPayable: 10000.00,
            panBankDetails: 'PAN: CUTPV9394L\nBANK: State Bank of India,\nNesta, Tilda\nA/C: 39634349811\nIFSC: SBIN0001470'
        },
        {
            id: 5,
            name: 'Mr. Naresh Kumar',
            designation: 'Hardware Maintenance Engineer',
            dateOfJoining: '24/11/24',
            grossRemuneration: 25000,
            daysWorked: '',
            casualLeave: '',
            weeklyOff: '',
            holidays: '',
            lwpDays: '',
            totalDays: '',
            payableDays: '',
            fixedRemuneration: 20000.00,
            variableRemuneration: 5000.00,
            totalRemuneration: 25000.00,
            tds: 0.00,
            otherDeduction: 0.00,
            netPayable: 25000.00,
            panBankDetails: 'PAN: BSVPK8707R\nBANK: Union Bank of India,\nBorsi, Durg\nA/C: 747902010017132\nIFSC: UBIN0576708'
        }
    ]);

    const handleChange = (id, field, value) => {
        if (!isFacultyInCharge) return;
        setEmployees(employees.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    const calculateTotals = () => {
        let totalVariable = 0;
        let totalTDS = 0;
        let totalOther = 0;
        let totalNetPayable = 0;

        employees.forEach(emp => {
            totalVariable += parseFloat(emp.variableRemuneration) || 0;
            totalTDS += parseFloat(emp.tds) || 0;
            totalOther += parseFloat(emp.otherDeduction) || 0;
            totalNetPayable += parseFloat(emp.netPayable) || 0;
        });

        return { totalVariable, totalTDS, totalOther, totalNetPayable };
    };

    const handleSave = async () => {
        if (!isFacultyInCharge) return;
        setSaving(true);
        try {
            // Placeholder - backend to be implemented later
            alert('Remuneration data saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!contentRef.current) return;

        const actionsDiv = document.querySelector('.remuneration-actions');
        if (actionsDiv) actionsDiv.style.display = 'none';

        const originalStyle = {
            width: contentRef.current.style.width,
            maxWidth: contentRef.current.style.maxWidth,
            overflow: contentRef.current.style.overflow
        };

        const tableContainer = contentRef.current.querySelector('.table-container');
        const originalTableStyle = {
            overflow: tableContainer ? tableContainer.style.overflow : '',
            maxWidth: tableContainer ? tableContainer.style.maxWidth : ''
        };

        contentRef.current.style.width = 'fit-content';
        contentRef.current.style.maxWidth = 'none';
        contentRef.current.style.overflow = 'visible';

        if (tableContainer) {
            tableContainer.style.overflow = 'visible';
            tableContainer.style.maxWidth = 'none';
        }

        setTimeout(() => {
            html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: contentRef.current.scrollWidth,
                windowHeight: contentRef.current.scrollHeight
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'l',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`Remuneration_${currentMonth}_${currentYear}.pdf`);

                if (actionsDiv) actionsDiv.style.display = 'flex';
                contentRef.current.style.width = originalStyle.width;
                contentRef.current.style.maxWidth = originalStyle.maxWidth;
                contentRef.current.style.overflow = originalStyle.overflow;

                if (tableContainer) {
                    tableContainer.style.overflow = originalTableStyle.overflow;
                    tableContainer.style.maxWidth = originalTableStyle.maxWidth;
                }
            }).catch(err => {
                console.error('PDF generation failed:', err);
                if (actionsDiv) actionsDiv.style.display = 'flex';
                contentRef.current.style.width = originalStyle.width;
                contentRef.current.style.maxWidth = originalStyle.maxWidth;
                contentRef.current.style.overflow = originalStyle.overflow;

                if (tableContainer) {
                    tableContainer.style.overflow = originalTableStyle.overflow;
                    tableContainer.style.maxWidth = originalTableStyle.maxWidth;
                }
            });
        }, 100);
    };

    const totals = calculateTotals();

    return (
        <div className="remuneration-page-container">
            <div className="remuneration-actions">
                {isFacultyInCharge && (
                    <button
                        className="action-btn save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Data'}
                    </button>
                )}
                <button
                    className="action-btn download-btn"
                    onClick={handleDownloadPDF}
                >
                    <Download size={18} />
                    Download PDF
                </button>
            </div>

            <div className="remuneration-container" ref={contentRef}>
                <div className="remuneration-header">
                    <h2>NIT Raipur Foundation for Innovation & Entrepreneurship (NITRR-FIE)</h2>
                    <h3>Attendance Record of Contractual Employees for the Month <span className="highlight-date">{currentMonth} {currentYear}</span></h3>
                </div>

                <div className="table-container">
                    <table className="remuneration-table">
                        <thead>
                            <tr>
                                <th>S. No.</th>
                                <th>Name</th>
                                <th>Designation / Engagement</th>
                                <th>Date of Joining</th>
                                <th>Consolidated Gross Remuneration (per month)<br />[in Rs.]</th>
                                <th>No. of days worked in Office</th>
                                <th>No. of days Casual Leave availed (CL)</th>
                                <th>No. of Admissible Weekly off Days</th>
                                <th>No. of Payable National Holidays (if any)</th>
                                <th>Total LWP No. of Days</th>
                                <th>Total No. of Days</th>
                                <th>Total No. of Payable Days</th>
                                <th>Fixed Remuneration (80% of Gross)<br />[in Rs.]</th>
                                <th>Variable Remuneration (20% of Gross)<br />[in Rs.]</th>
                                <th>Total Payable Remuneration<br />[in Rs.]</th>
                                <th>TDS Deducted<br />[in Rs.]</th>
                                <th>Other Deduction<br />[in Rs.]</th>
                                <th>Net Payable Remuneration<br />[in Rs.]</th>
                                <th>PAN & Bank Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, index) => (
                                <tr key={emp.id}>
                                    <td>{index + 1}</td>
                                    <td className="name-cell">{emp.name}</td>
                                    <td className="designation-cell">{emp.designation}</td>
                                    <td>{emp.dateOfJoining}</td>
                                    <td>{emp.grossRemuneration?.toLocaleString()}/-</td>
                                    <td>{emp.daysWorked}</td>
                                    <td>{emp.casualLeave}</td>
                                    <td>{emp.weeklyOff}</td>
                                    <td>{emp.holidays}</td>
                                    <td>{emp.lwpDays}</td>
                                    <td>{emp.totalDays}</td>
                                    <td>{emp.payableDays}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input wide-input"
                                            value={emp.fixedRemuneration}
                                            onChange={(e) => handleChange(emp.id, 'fixedRemuneration', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input wide-input"
                                            value={emp.variableRemuneration}
                                            onChange={(e) => handleChange(emp.id, 'variableRemuneration', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input wide-input"
                                            value={emp.totalRemuneration}
                                            onChange={(e) => handleChange(emp.id, 'totalRemuneration', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.tds}
                                            onChange={(e) => handleChange(emp.id, 'tds', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.otherDeduction}
                                            onChange={(e) => handleChange(emp.id, 'otherDeduction', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input wide-input"
                                            value={emp.netPayable}
                                            onChange={(e) => handleChange(emp.id, 'netPayable', e.target.value)}
                                            disabled={!isFacultyInCharge}
                                        />
                                    </td>
                                    <td className="pan-cell">
                                        <pre>{emp.panBankDetails}</pre>
                                    </td>
                                </tr>
                            ))}
                            <tr className="totals-row">
                                <td colSpan="13"><strong>Total</strong></td>
                                <td><strong>{totals.totalVariable.toFixed(2)}</strong></td>
                                <td></td>
                                <td><strong>{totals.totalTDS.toFixed(2)}</strong></td>
                                <td><strong>{totals.totalOther.toFixed(2)}</strong></td>
                                <td><strong>{totals.totalNetPayable.toFixed(2)}</strong></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="certifications">
                    <p>1) Certified that the above employee(s) have delivered their duty satisfactorily during the mentioned month.</p>
                    <p>2) Certified that Approval of Competent Authority is available for deployment of above employees.</p>
                    <p>3) Certified that the Balance amount of <strong>Rs. _______________</strong> is available on date under the Recurring Manpower Head (B.1) of the project.</p>
                    <p>4) Forwarded for release of Remuneration to above employee(s) concerned from the above head.</p>
                </div>

                <div className="signature-section-full">
                    <div className="signature">
                        <p><strong>Faculty In-Charge, Incubation Cell,</strong></p>
                        <p>NIT Raipur</p>
                    </div>
                    <div className="signature">
                        <p><strong>Board Director, NITRRFIE</strong></p>
                        <p>Head CDC, NIT Raipur</p>
                    </div>
                    <div className="signature">
                        <p><strong>Board Director, NITRRFIE</strong></p>
                        <p>Director, NIT Raipur</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Remuneration;
