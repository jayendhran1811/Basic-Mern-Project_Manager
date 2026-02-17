import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    Users,
    Calendar,
    Shield
} from 'lucide-react';
import './WeeklyReport.css';
import Loading from '../ui/Loading';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const WeeklyReport = () => {
    const { user } = useAuth();
    const [weeklyData, setWeeklyData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWeeks, setSelectedWeeks] = useState(4);
    const [selectedEmployee, setSelectedEmployee] = useState(user?.role === 'employee' ? user._id : '');
    const [employees, setEmployees] = useState([]);
    const [employeeStats, setEmployeeStats] = useState({ completed: 0, inProgress: 0, pending: 0 });

    useEffect(() => {
        fetchReportData();
        if (user?.role === 'admin') {
            fetchEmployees();
        }
    }, [selectedWeeks, selectedEmployee]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const targetEmployee = user?.role === 'employee' ? user._id : selectedEmployee;

            const [weeklyResponse, summaryResponse] = await Promise.all([
                reportsAPI.getWeeklyReport(selectedWeeks, targetEmployee || null),
                reportsAPI.getSummary(targetEmployee || null)
            ]);

            setWeeklyData(weeklyResponse.data || []);
            setSummary(summaryResponse.data || { total: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0, overdue: 0, completionPercentage: 0 });
        } catch (error) {
            console.error('Error fetching report data:', error);
            setSummary({ total: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0, overdue: 0, completionPercentage: 0 });
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { authAPI } = await import('../../utils/apiClient');
            const response = await authAPI.getAllEmployees();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    // Chart data for Bar Chart
    const barChartData = {
        labels: weeklyData.map(w => w.week),
        datasets: [
            {
                label: 'Completed',
                data: weeklyData.map(w => w.completed),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1
            },
            {
                label: 'In Progress',
                data: weeklyData.map(w => w.inProgress),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            },
            {
                label: 'Pending',
                data: weeklyData.map(w => w.pending),
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1
            },
            {
                label: 'Blocked',
                data: weeklyData.map(w => w.blocked),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1
            }
        ]
    };

    // Chart data for Line Chart
    const lineChartData = {
        labels: weeklyData.map(w => w.week),
        datasets: [
            {
                label: 'Completion Rate (%)',
                data: weeklyData.map(w => w.completionRate),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 11
                    }
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const lineChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                max: 100,
                ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: (value) => value + '%'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="weekly-report-container">
                <Loading text="Analyzing task data..." />
            </div>
        );
    }

    return (
        <div className="weekly-report-container">
            <div className="report-header">
                <div className="header-left">
                    <h1>Weekly Task Report</h1>
                    <p>Comprehensive analytics and performance tracking</p>
                </div>
                <div className="header-actions">
                    <button className="btn-download" onClick={handleDownloadPDF}>
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="report-filters">
                <div className="filter-group">
                    <label htmlFor="weeks-filter">
                        <Calendar size={16} />
                        Time Period
                    </label>
                    <select
                        id="weeks-filter"
                        value={selectedWeeks}
                        onChange={(e) => setSelectedWeeks(parseInt(e.target.value))}
                        className="filter-select"
                    >
                        <option value={1}>This Week</option>
                        <option value={2}>Last 2 Weeks</option>
                        <option value={4}>Last 4 Weeks</option>
                        <option value={8}>Last 8 Weeks</option>
                        <option value={12}>Last 12 Weeks</option>
                    </select>
                </div>

                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <div className="report-sidebar">
                        <h3>Personnel Index</h3>
                        <div className="employee-list-grid">
                            <div
                                className={`employee-stat-card ${!selectedEmployee ? 'active' : ''}`}
                                onClick={() => setSelectedEmployee('')}
                            >
                                <span className="emp-name">Global Organization Overview</span>
                            </div>
                            {employees.map(emp => (
                                <div
                                    key={emp._id}
                                    className={`employee-stat-card ${selectedEmployee === emp._id ? 'active' : ''}`}
                                    onClick={() => setSelectedEmployee(emp._id)}
                                >
                                    <div className="emp-avatar">{emp.firstName.charAt(0)}</div>
                                    <div className="emp-info">
                                        <span className="emp-name">{emp.firstName} {emp.lastName}</span>
                                        <span className="emp-dept">{emp.department || 'General Staff'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {user?.role === 'employee' && (
                <div className="self-report-banner">
                    <Shield size={16} />
                    <span>Self-Report Environment: Access restricted to personal performance data.</span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card card-total">
                    <div className="card-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Total Tasks</h3>
                        <p className="card-value">{summary?.total || 0}</p>
                        <span className="card-label">All time</span>
                    </div>
                </div>

                <div className="summary-card card-completed">
                    <div className="card-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Completion Rate</h3>
                        <p className="card-value">{summary?.completionPercentage || 0}%</p>
                        <span className="card-label">{summary?.completed || 0} of {summary?.total || 0} completed</span>
                    </div>
                </div>

                <div className="summary-card card-progress">
                    <div className="card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="card-content">
                        <h3>In Progress</h3>
                        <p className="card-value">{summary?.inProgress || 0}</p>
                        <span className="card-label">Active tasks</span>
                    </div>
                </div>

                <div className="summary-card card-overdue">
                    <div className="card-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Overdue Tasks</h3>
                        <p className="card-value">{summary?.overdue || 0}</p>
                        <span className="card-label">Requires attention</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-container">
                    <div className="chart-header">
                        <h2>Task Status Distribution</h2>
                        <p>Weekly breakdown by status</p>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-header">
                        <h2>Completion Rate Trend</h2>
                        <p>Weekly completion percentage</p>
                    </div>
                    <div className="chart-wrapper">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="data-table-container">
                <div className="table-header">
                    <h2>Detailed Weekly Breakdown</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Week</th>
                                <th>Total</th>
                                <th>Completed</th>
                                <th>In Progress</th>
                                <th>Pending</th>
                                <th>Blocked</th>
                                <th>Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyData.map((week, index) => (
                                <tr key={index}>
                                    <td className="week-cell">{week.week}</td>
                                    <td className="total-cell">{week.total}</td>
                                    <td className="completed-cell">{week.completed}</td>
                                    <td className="progress-cell">{week.inProgress}</td>
                                    <td className="pending-cell">{week.pending}</td>
                                    <td className="blocked-cell">{week.blocked}</td>
                                    <td className="rate-cell">
                                        <div className="rate-badge">{week.completionRate}%</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReport;
