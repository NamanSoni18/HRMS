import { useState, useEffect } from 'react';
import './VariableRemuneration.css';

const VariableRemuneration = () => {
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: "Mr. Sunil Dewangan",
            designation: "Incubation Manager\n(Appoinment letter No. NITRR/CDC/NITRRFIE/2024/828 dated 09/08/2024)",
            maxRemuneration: 10000,
            punctuality: "",
            sincerity: "",
            responsiveness: "",
            assignedTask: "",
            peerRating: "",
        },
        {
            id: 2,
            name: "Mr. Ashok Sahu",
            designation: "Accountant Cum Administrator\n(Appoinment letter No.NITRR/CDC/NITRRFIE/2024/833 dated 29/08/2024)",
            maxRemuneration: 6000,
            punctuality: "",
            sincerity: "",
            responsiveness: "",
            assignedTask: "",
            peerRating: "",
        }
    ]);

    const calculateTotalScore = (emp) => {
        const p = parseFloat(emp.punctuality) || 0;
        const s = parseFloat(emp.sincerity) || 0;
        const r = parseFloat(emp.responsiveness) || 0;
        const a = parseFloat(emp.assignedTask) || 0;
        const pr = parseFloat(emp.peerRating) || 0;
        return p + s + r + a + pr;
    };

    const calculatePercentage = (totalScore) => {
        if (totalScore > 80) return 100;
        if (totalScore >= 60) return 90;
        if (totalScore >= 50) return 80;
        if (totalScore >= 40) return 50;
        if (totalScore >= 30) return 40;
        return 30;
    };

    const handleScoreChange = (id, field, value) => {
        // Validate input (0-20)
        let numValue = value === "" ? "" : parseFloat(value);
        if (numValue !== "" && (numValue < 0 || numValue > 20)) return;

        setEmployees(employees.map(emp =>
            emp.id === id ? { ...emp, [field]: value } : emp
        ));
    };

    return (
        <div className="remuneration-container">
            <div className="remuneration-header">
                <h2>NIT Raipur Foundation for Innovation & Entrepreneurship (NITRR-FIE)</h2>
                <h3>Variable Remuneration of Contractual Employees for the Month June 2025</h3>
            </div>

            <div className="table-container">
                <table className="remuneration-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Name</th>
                            <th>Designation / Engagement</th>
                            <th>Maximum Variable Remuneration (In Rs.)</th>
                            <th>Punctuality (Out of 20)</th>
                            <th>Sincerity (Out of 20)</th>
                            <th>Responsiveness (Out of 20)</th>
                            <th>Assigned Task (Out of 20)</th>
                            <th>Peer Rating (Out of 20)</th>
                            <th>Total Score (Out of 100)</th>
                            <th>Total % of Variable Remuneration Recommended</th>
                            <th>Variable Remuneration Recommended (in Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, index) => {
                            const totalScore = calculateTotalScore(emp);
                            const percentage = calculatePercentage(totalScore);
                            const recommendedAmount = (emp.maxRemuneration * percentage) / 100;

                            return (
                                <tr key={emp.id}>
                                    <td>{index + 1}</td>
                                    <td>{emp.name}</td>
                                    <td className="designation-cell">{emp.designation}</td>
                                    <td>{emp.maxRemuneration.toFixed(2)}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.punctuality}
                                            onChange={(e) => handleScoreChange(emp.id, 'punctuality', e.target.value)}
                                            max="20"
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.sincerity}
                                            onChange={(e) => handleScoreChange(emp.id, 'sincerity', e.target.value)}
                                            max="20"
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.responsiveness}
                                            onChange={(e) => handleScoreChange(emp.id, 'responsiveness', e.target.value)}
                                            max="20"
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.assignedTask}
                                            onChange={(e) => handleScoreChange(emp.id, 'assignedTask', e.target.value)}
                                            max="20"
                                            min="0"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="score-input"
                                            value={emp.peerRating}
                                            onChange={(e) => handleScoreChange(emp.id, 'peerRating', e.target.value)}
                                            max="20"
                                            min="0"
                                        />
                                    </td>
                                    <td className="total-score">{totalScore}</td>
                                    <td className="percentage">{percentage}%</td>
                                    <td className="recommended-amount">{recommendedAmount.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="criteria-section">
                <h4>Note: Criteria for evaluation of % of Variable Remuneration Recommended is given below</h4>
                <div className="criteria-table-wrapper">
                    <table className="criteria-table">
                        <thead>
                            <tr>
                                <th>Total Score</th>
                                <th>% Variable Remuneration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Above 80</td><td>100%</td></tr>
                            <tr><td>80-60</td><td>90%</td></tr>
                            <tr><td>60-50</td><td>80%</td></tr>
                            <tr><td>50-40</td><td>50%</td></tr>
                            <tr><td>40-30</td><td>40%</td></tr>
                            <tr><td>Below 30</td><td>30%</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="certifications">
                <p>1) Certified that the above employee(s) have delivered their duty satisfactorily during the mentioned month.</p>
                <p>2) Certified that Approval of Competent Authority is available for deployment of above employees.</p>
                <p>3) Forwarded to the concerned team for the release of Variable Remuneration to the above employee(s) as per rating and recommendation.</p>
            </div>

            <div className="signature-section">
                <div className="signature">
                    <p>Faculty In-Charge</p>
                    <p>Incubation Cell, NIT Raipur</p>
                </div>
            </div>
        </div>
    );
};

export default VariableRemuneration;
