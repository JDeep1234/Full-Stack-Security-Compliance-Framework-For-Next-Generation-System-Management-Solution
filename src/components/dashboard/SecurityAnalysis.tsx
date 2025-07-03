import React, { useEffect, useState } from 'react';
import { useComplianceStore, SecurityAnalysisReport } from '../../store/complianceStore';
import { Shield, Clock, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const SecurityAnalysis: React.FC = () => {
  const { 
    securityReports, 
    fetchSecurityReports, 
    getSecurityReport, 
    currentReport,
    loading,
    generateRemediationPlan,
    remediationPlan
  } = useComplianceStore();
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRemediationModal, setShowRemediationModal] = useState(false);
  
  useEffect(() => {
    fetchSecurityReports();
  }, [fetchSecurityReports]);
  
  const handleViewReport = async (reportId: string) => {
    await getSecurityReport(reportId);
    setSelectedReportId(reportId);
    setShowReportModal(true);
  };
  
  const handleRemediationPlan = async () => {
    await generateRemediationPlan();
    setShowReportModal(false);
    setShowRemediationModal(true);
  };
  
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Shield className="h-5 w-5 text-primary-500 mr-2" />
        <h2 className="text-lg font-medium text-white">Security Analysis Reports</h2>
      </div>
      
      {loading.reports ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-primary-400">Loading reports...</div>
        </div>
      ) : securityReports.length === 0 ? (
        <div className="text-center py-6 text-neutral-400">
          <p>No security analysis reports available.</p>
          <p className="mt-2 text-sm">Click "Analyze CIS Compliance" to generate a report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {securityReports.map((report) => (
            <div 
              key={report.reportId} 
              className="p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 cursor-pointer"
              onClick={() => handleViewReport(report.reportId)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-primary-400 mr-2" />
                  <div>
                    <h3 className="font-medium text-white">{report.title}</h3>
                    <div className="flex items-center text-sm text-neutral-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(report.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Report Detail Modal */}
      {showReportModal && currentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{currentReport.title}</h2>
                <button 
                  className="text-neutral-400 hover:text-white"
                  onClick={() => setShowReportModal(false)}
                >
                  ✕
                </button>
              </div>
              
              {/* Report Header */}
              <div className="mb-5 flex flex-wrap justify-between items-center">
                <div className="space-y-1 mb-3">
                  <div className="text-sm text-neutral-400">Generated on: {formatDate(currentReport.timestamp)}</div>
                  <div className="text-sm text-neutral-400">Framework: <span className="capitalize">{currentReport.framework}</span></div>
                  <div className="text-sm text-neutral-400">Analysis Type: <span className="capitalize">{currentReport.analysisType}</span></div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 rounded bg-error-900 text-error-200 font-medium flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {currentReport.analysis?.overallRiskRating}
                  </div>
                  <div className="px-3 py-1 rounded bg-neutral-700 text-neutral-200">
                    Compliance: {currentReport.analysis?.complianceStatus.overallCompliance.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Report Summary */}
              {currentReport.analysis?.summary && (
                <div className="mb-6 p-4 bg-neutral-700 bg-opacity-20 rounded-lg border border-neutral-700">
                  <h3 className="font-medium text-white mb-2">Executive Summary</h3>
                  <p className="text-neutral-300">{currentReport.analysis.summary}</p>
                </div>
              )}
              
              {/* Issues List */}
              {currentReport.analysis?.issues && currentReport.analysis.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">Critical Issues</h3>
                  <div className="space-y-3">
                    {currentReport.analysis.issues.map((issue, index) => (
                      <div key={index} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${issue.severity === 'critical' ? 'bg-error-500' : issue.severity === 'high' ? 'bg-warning-500' : 'bg-info-500'}`}></div>
                          <h4 className="font-medium text-white">{issue.id}: {issue.title}</h4>
                        </div>
                        <p className="mt-2 text-sm text-neutral-300">{issue.description}</p>
                        <div className="mt-3 pt-3 border-t border-neutral-800 text-sm">
                          <div className="text-neutral-400"><span className="text-neutral-300 font-medium">Impact:</span> {issue.impact}</div>
                          <div className="text-neutral-400 mt-1"><span className="text-neutral-300 font-medium">Remediation:</span> {issue.remediation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {currentReport.analysis?.recommendations && currentReport.analysis.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-white mb-3">Recommendations</h3>
                  <div className="space-y-3">
                    {currentReport.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${rec.priority === 'critical' ? 'bg-error-500' : rec.priority === 'high' ? 'bg-warning-500' : 'bg-info-500'}`}></div>
                          <h4 className="font-medium text-white">{rec.title}</h4>
                        </div>
                        <p className="mt-2 text-sm text-neutral-300">{rec.description}</p>
                        {rec.steps && rec.steps.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-neutral-800 text-sm">
                            <div className="text-neutral-300 font-medium mb-2">Implementation Steps:</div>
                            <ol className="list-decimal pl-5 space-y-1 text-neutral-400">
                              {rec.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button 
                  className="btn-primary"
                  onClick={handleRemediationPlan}
                  disabled={loading.remediationPlan}
                >
                  {loading.remediationPlan ? 'Generating...' : 'Generate Remediation Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Remediation Plan Modal */}
      {showRemediationModal && remediationPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Security Remediation Plan</h2>
                <button 
                  className="text-neutral-400 hover:text-white"
                  onClick={() => setShowRemediationModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{remediationPlan}</ReactMarkdown>
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  className="btn-primary"
                  onClick={() => setShowRemediationModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAnalysis; 