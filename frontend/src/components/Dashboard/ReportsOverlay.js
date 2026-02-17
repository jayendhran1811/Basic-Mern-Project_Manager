import React, { useMemo } from 'react';
import {
    X,
    TrendingUp,
    BarChart3,
    Activity,
    ShieldCheck,
    MousePointer2,
    Calendar,
    Target
} from 'lucide-react';

const ReportsOverlay = ({ isOpen, onClose, stats, recentProjects }) => {
    if (!isOpen) return null;

    // Generate path for the Sine-like "Line Graph" using Bézier curves for smoothness
    const lineData = [30, 45, 35, 60, 55, 80, 75];
    const width = 400;
    const height = 150;
    const padding = 20;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const getCoord = (index, value) => {
        const x = padding + (index / (lineData.length - 1)) * usableWidth;
        const y = height - (value / 100 * usableHeight + padding);
        return { x, y };
    };

    const generatePath = () => {
        let path = "";
        lineData.forEach((val, i) => {
            const { x, y } = getCoord(i, val);
            if (i === 0) {
                path = `M ${x} ${y}`;
            } else {
                const prev = getCoord(i - 1, lineData[i - 1]);
                // Control points for smooth curve
                const cp1x = prev.x + (x - prev.x) / 2;
                const cp1y = prev.y;
                const cp2x = prev.x + (x - prev.x) / 2;
                const cp2y = y;
                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
            }
        });
        return path;
    };

    const generateAreaPath = () => {
        const linePath = generatePath();
        return `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-professional card max-w-[900px] w-[95%] max-h-[90vh] overflow-y-auto">
                <div className="modal-header border-b border-border/50 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">System Performance Report</h2>
                            <p className="text-sm text-muted-foreground">Visualization of project velocity and completion</p>
                        </div>
                    </div>
                    <button className="btn-icon hover:bg-muted p-2 rounded-full transition-colors" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Activity size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Velocity</span>
                        </div>
                        <h3 className="text-2xl font-bold">84%</h3>
                        <p className="text-[10px] text-muted-foreground">Project completion efficiency</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Quality</span>
                        </div>
                        <h3 className="text-2xl font-bold">99.2%</h3>
                        <p className="text-[10px] text-muted-foreground">Average uptime across nodes</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <Target size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Milestones</span>
                        </div>
                        <h3 className="text-2xl font-bold">{stats.completedProjects} / {stats.totalProjects}</h3>
                        <p className="text-[10px] text-muted-foreground">Projects delivered on schedule</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Line Chart / Sine Graph */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <TrendingUp size={16} className="text-primary" />
                                Project Progress Velocity
                            </h4>
                            <span className="text-[10px] bg-muted px-2 py-1 rounded font-mono">Real-time Data</span>
                        </div>
                        <div className="relative h-[200px] border border-border/40 rounded-2xl bg-muted/20 overflow-hidden flex items-center justify-center p-4">
                            <svg viewBox="0 0 400 150" className="w-full h-full drop-shadow-lg">
                                <defs>
                                    <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                {[0, 1, 2, 3].map(i => (
                                    <line key={i} x1="20" y1={20 + i * 36.6} x2="380" y2={20 + i * 36.6} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                                ))}
                                {/* Area */}
                                <path d={generateAreaPath()} fill="url(#lineFill)" />
                                {/* Sparkline */}
                                <path
                                    d={generatePath()}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Dots */}
                                {lineData.map((val, i) => {
                                    const { x, y } = getCoord(i, val);
                                    return (
                                        <circle key={i} cx={x} cy={y} r="4" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-2">
                            <span>MON</span>
                            <span>TUE</span>
                            <span>WED</span>
                            <span>THU</span>
                            <span>FRI</span>
                            <span>SAT</span>
                            <span>SUN</span>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <BarChart3 size={16} className="text-indigo-500" />
                                Task Distribution
                            </h4>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="size-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-[10px] text-muted-foreground">Ongoing</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="size-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-muted-foreground">Pass</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[200px] border border-border/40 rounded-2xl bg-muted/20 flex items-end justify-around p-6 gap-4">
                            {[65, 40, 85, 55, 70, 45, 90].map((val, i) => (
                                <div key={i} className="flex-1 group relative flex flex-col items-center gap-2">
                                    <div className="w-full relative flex items-end justify-center h-[130px]">
                                        <div
                                            className="w-full max-w-[12px] bg-indigo-500/20 rounded-t-full absolute h-full"
                                        ></div>
                                        <div
                                            className="w-full max-w-[12px] bg-indigo-500 rounded-t-full transition-all duration-500 ease-out group-hover:bg-indigo-400"
                                            style={{ height: `${val}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[9px] py-0.5 px-1.5 rounded pointer-events-none">
                                                {val}%
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground">P{i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground text-center">
                            Aggregated load across top 7 projects
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold tracking-tight">Project Health metrics</h4>
                        <button className="text-[11px] text-primary font-bold hover:underline">Download PDF</button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {recentProjects.slice(0, 4).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs ${i % 2 === 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {p.title.charAt(0)}
                                    </div>
                                    <span className="text-xs font-semibold truncate max-w-[120px]">{p.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-[10px] text-muted-foreground block">Progress</span>
                                        <span className="text-[11px] font-bold">{p.status === 'completed' ? '100' : '65'}%</span>
                                    </div>
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${p.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`}
                                            style={{ width: p.status === 'completed' ? '100%' : '65%' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsOverlay;
