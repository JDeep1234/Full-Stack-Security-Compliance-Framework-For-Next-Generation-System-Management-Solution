import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ComplianceFramework } from '../../types/compliance';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ComplianceSummaryProps {
  frameworks: ComplianceFramework[];
}

const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({ frameworks }) => {
  const [expanded, setExpanded] = useState(true);
  
  // Calculate overall compliance
  const totalOverallControls = frameworks.reduce((acc, framework) => acc + framework.totalControls, 0);
  const totalCompliantControls = frameworks.reduce((acc, framework) => acc + framework.compliantCount, 0);
  
  const overallCompliancePercentage = totalOverallControls > 0
    ? Math.round((totalCompliantControls / totalOverallControls) * 100)
    : 0;

  const overallNonCompliantControls = totalOverallControls - totalCompliantControls;

  // Calculate severity-based compliance
  const criticalFindings = frameworks.reduce((acc, framework) => 
    acc + (framework.findings?.filter(f => f.severity === 'critical' && f.status !== 'compliant').length || 0), 0);
  const highFindings = frameworks.reduce((acc, framework) => 
    acc + (framework.findings?.filter(f => f.severity === 'high' && f.status !== 'compliant').length || 0), 0);
    
  const complianceData = [
    { 
      name: 'Compliant', 
      value: totalCompliantControls, 
      color: '#4CAF50',
      label: `${totalCompliantControls} Compliant`
    },
    { 
      name: 'Non-Compliant', 
      value: overallNonCompliantControls, 
      color: '#F44336',
      label: `${overallNonCompliantControls} Non-Compliant`
    },
  ];

  // Special case: if there are no compliant controls (0%), adjust the pie chart data
  // to show a full red circle instead of nothing, unless total controls are also 0.
  const pieChartData = totalCompliantControls === 0 && totalOverallControls > 0
    ? [{ 
        name: 'Non-Compliant', 
        value: 100, 
        color: '#F44336',
        label: `${overallNonCompliantControls} Non-Compliant`
      }]
    : totalOverallControls === 0
      ? [{ 
          name: 'No Data', 
          value: 100, 
          color: '#6B7280',
          label: 'No Assessment Data'
        }]
      : complianceData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-neutral-300 text-sm">{data.label}</p>
          {data.name === 'Non-Compliant' && (
            <div className="mt-2 text-sm">
              <p className="text-red-400">Critical: {criticalFindings}</p>
              <p className="text-orange-400">High: {highFindings}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Compliance Summary</h2>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-neutral-400 hover:text-white"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {expanded && (
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center mb-4 md:mb-0">
              <div className="text-4xl font-bold text-white">{overallCompliancePercentage}%</div>
              <div className="text-sm text-neutral-400 mt-1">Overall Compliance</div>
              <div className="mt-3 flex flex-col gap-1">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-success-500 mr-2"></span>
                  <span className="text-sm">
                    {totalCompliantControls} Compliant Controls
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-error-500 mr-2"></span>
                  <span className="text-sm">
                    {overallNonCompliantControls} Non-Compliant Controls
                  </span>
                </div>
                {criticalFindings > 0 && (
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-sm text-red-400">
                      {criticalFindings} Critical Findings
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-48 w-full md:w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={pieChartData.length > 1 ? 2 : 0}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-neutral-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">Framework Compliance</h3>
            <div className="space-y-3">
              {frameworks.filter(fw => fw.status !== 'not-assessed').map((framework) => {
                const frameworkPercentage = framework.totalControls > 0
                  ? Math.round((framework.compliantCount / framework.totalControls) * 100)
                  : 0;
                
                let barColor = 'bg-error-500';
                if (frameworkPercentage >= 80) barColor = 'bg-success-500';
                else if (frameworkPercentage >= 50) barColor = 'bg-warning-500';
                
                return (
                  <div key={framework.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{framework.name}</span>
                      <span className="text-sm text-neutral-400">{frameworkPercentage}%</span>
                    </div>
                    <div className="w-full bg-background-light rounded-full h-2.5">
                      <div 
                        className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${frameworkPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {frameworks.filter(fw => fw.status !== 'not-assessed').length === 0 && (
                <div className="text-center py-4 text-neutral-500">
                  No frameworks have been assessed yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceSummary;