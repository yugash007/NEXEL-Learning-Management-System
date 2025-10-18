import React from 'react';

interface ChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: ChartData[];
    title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    const chartHeight = 300;
    const chartWidth = 600;
    const barWidth = 40;
    const barMargin = 20;
    const maxValue = 100;

    const scale = chartHeight / maxValue;

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-on-surface-secondary">{title}: No data to display.</div>;
    }

    return (
        <div className="w-full overflow-x-auto p-4">
            <h3 className="text-lg font-semibold text-center mb-4 text-on-surface">{title}</h3>
            <svg
                width="100%"
                height={chartHeight + 40}
                viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ maxWidth: `${chartWidth}px`, margin: '0 auto' }}
            >
                {/* Y-axis Lines and Labels */}
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={`y-axis-${val}`}>
                        <text x="25" y={chartHeight - val * scale + 5} textAnchor="end" fontSize="10" fill="#9CA3AF">{val}</text>
                        <line 
                            x1="30" 
                            y1={chartHeight - val * scale} 
                            x2={chartWidth} 
                            y2={chartHeight - val * scale} 
                            stroke={val === 0 ? "#374151" : "#374151"} 
                            strokeDasharray={val === 0 ? "0" : "2 4"}
                        />
                    </g>
                ))}

                {/* Bars and X-axis Labels */}
                {data.map((item, index) => {
                    const barHeight = item.value * scale;
                    const x = 50 + index * (barWidth + barMargin);
                    const y = chartHeight - barHeight;

                    return (
                        <g key={item.label}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#8b5cf6"
                                rx="4"
                            />
                            <text
                                x={x + barWidth / 2}
                                y={y - 5}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="bold"
                                fill="#c4b5fd"
                            >
                                {item.value}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight + 15}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#9CA3AF"
                            >
                                {item.label.length > 15 ? `${item.label.substring(0, 12)}...` : item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default BarChart;