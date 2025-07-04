// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useComplianceStore } from '../store/complianceStore';
import ComplianceSummary from '../components/dashboard/ComplianceSummary';
import RecentAssessments from '../components/dashboard/RecentAssessments';
import ToolStatus from '../components/dashboard/ToolStatus';
import ThreatSummary from '../components/dashboard/ThreatSummary';
import { AlertTriangle, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const shouldRefresh = 
    location.state?.refreshData || 
    (typeof window !== 'undefined' && sessionStorage.getItem('dashboard_refresh') === 'true') || 
    (typeof window !== 'undefined' && sessionStorage.getItem('lynis_ran') === 'true');
  
  const { 
    frameworks, 
    assessments, 
    tools, 
    loading, 
    fetchFrameworks, 
    fetchAssessments, 
    fetchTools
  } = useComplianceStore();

  useEffect(() => {
    if (!shouldRefresh && typeof window !== 'undefined') {
      sessionStorage.removeItem('lynis_ran');
      localStorage.removeItem('lynis_ran');
    }
    
    if (shouldRefresh && typeof window !== 'undefined') {
      sessionStorage.removeItem('dashboard_refresh');
      
      fetchFrameworks();
      fetchAssessments();
      fetchTools();
    } else {
      fetchFrameworks();
      fetchAssessments();
      fetchTools();
    }
  }, [fetchFrameworks, fetchAssessments, fetchTools, shouldRefresh]);

  const analyzeJsonFiles = async () => {
    setIsAnalyzing(true);
    try {
      let scaData, networkData, processData;
      
      try {
        const scaModule = await import('../components/wazuh/failed_sca_results_2025-06-10.json');
        scaData = scaModule.default;
      } catch (error) {
        console.error('Failed to load SCA data:', error);
        scaData = { error: 'Failed to load SCA results data' };
      }

      try {
        const networkModule = await import('../components/wazuh/network_ports_2025-06-10T10-17-03-444Z.json');
        networkData = networkModule.default;
      } catch (error) {
        console.error('Failed to load network data:', error);
        networkData = { error: 'Failed to load network ports data' };
      }

      try {
        const processModule = await import('../components/wazuh/processes_data_2025-06-10.json');
        processData = processModule.default;
      } catch (error) {
        console.error('Failed to load process data:', error);
        processData = { error: 'Failed to load process data' };
      }

      const prompt = `Analyze the following security data for CIS compliance and provide simple remediation recommendations:

1. Failed SCA Results:
${JSON.stringify(scaData, null, 2)}

2. Network Ports:
${JSON.stringify(networkData, null, 2)}

3. Process Data:
${JSON.stringify(processData, null, 2)}

Please provide:
1. Summary of CIS compliance issues found
2. Risk assessment for open ports
3. Process-related security concerns
4. Simple, actionable remediation steps for each issue
5. Priority ranking (Critical/High/Medium/Low)

Format the response in clear, non-technical language that system administrators can easily understand and implement.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
      }

      const data = await response.json();
      setAnalysisResult(data.choices[0].message.content);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult(`Analysis failed: ${error.message}\n\nThis could be due to:\n1. Invalid API key\n2. Network connectivity issues\n3. Missing JSON files\n4. API rate limits\n\nPlease verify your API key and file paths.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isLoading = loading.frameworks || loading.assessments || loading.tools;

  const criticalIssues = assessments
    .filter(a => a.status === 'completed')
    .flatMap(a => a.findings || [])
    .filter(f => f.status !== 'compliant' && f.severity === 'critical')
    .length;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Compliance Dashboard</h1>
          <p className="text-neutral-400 mt-1">Overview of your HPC systems compliance status</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button className="btn-primary">Run New Assessment</button>
          <button 
            onClick={analyzeJsonFiles}
            disabled={isAnalyzing}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText size={16} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze JSON'}
          </button>
        </div>
      </div>
      
      {analysisResult && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">CIS Compliance Analysis Results</h3>
          <div className="text-neutral-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {analysisResult}
          </div>
          <button 
            onClick={() => setAnalysisResult(null)}
            className="mt-4 btn-outline text-sm"
          >
            Close Analysis
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-primary-400">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {criticalIssues > 0 && (
            <div className="bg-error-900 border border-error-800 text-error-100 p-4 rounded-lg mb-6 flex items-center animate-fade-in">
              <AlertTriangle className="flex-shrink-0 text-error-500 mr-3" size={24} />
              <div>
                <h3 className="font-medium">Critical Issues Detected</h3>
                <p className="mt-1 text-sm">
                  {criticalIssues} critical compliance {criticalIssues === 1 ? 'issue needs' : 'issues need'} immediate attention.
                </p>
              </div>
              <button className="ml-auto btn-outline border-error-700 text-error-100 hover:bg-error-800 px-3 py-1 text-sm">
                View Details
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComplianceSummary frameworks={frameworks} />
            </div>
            <div>
              <ToolStatus tools={tools} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <RecentAssessments assessments={assessments} frameworks={frameworks} />
            </div>
            <div>
              <ThreatSummary assessments={assessments} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;