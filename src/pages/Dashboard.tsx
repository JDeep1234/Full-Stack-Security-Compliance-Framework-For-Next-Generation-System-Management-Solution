import React, { useEffect, useState } from 'react';
import { useComplianceStore } from '../store/complianceStore';
import ComplianceSummary from '../components/dashboard/ComplianceSummary';
import RecentAssessments from '../components/dashboard/RecentAssessments';
import ToolStatus from '../components/dashboard/ToolStatus';
import ThreatSummary from '../components/dashboard/ThreatSummary';
import { AlertTriangle, FileText, CheckCircle, Clock, XCircle, BarChart3, Shield, Server, Network, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AnalysisStatus {
  sca: 'pending' | 'processing' | 'completed' | 'failed';
  network: 'pending' | 'processing' | 'completed' | 'failed';
  process: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ProcessingMetrics {
  totalRules: number;
  processedRules: number;
  batchCount: number;
  currentBatch: number;
  estimatedTime: string;
  fileSize: string;
}

type DashboardTab = 'overview' | 'security' | 'network' | 'system' | 'tools';

interface AnalysisResult {
  security: string | null;
  network: string | null;
  system: string | null;
  tools: string | null;
  executive: string | null;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    security: null,
    network: null,
    system: null,
    tools: null,
    executive: null
  });
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
    sca: 'pending',
    network: 'pending',
    process: 'pending'
  });
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState<string>('');
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics | null>(null);
  
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

  // Helper function to validate and normalize imported data
  const validateAndNormalizeData = (data: any, dataType: string): any => {
  console.log(`Validating ${dataType} data:`, data);
  
  if (!data) {
    console.warn(`${dataType} data is null or undefined`);
    return { error: `${dataType} data not available`, data: [] };
  }

  // Handle different data structures
  if (dataType === 'SCA') {
    // SCA data might be an array or an object with a results/data property
    if (Array.isArray(data)) {
      return data;
    } else if (data.failed_results && Array.isArray(data.failed_results)) {
      // Handle the actual structure: { "failed_results": [...] }
      return data.failed_results;
    } else if (data.results && Array.isArray(data.results)) {
      return data.results;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.failed_rules && Array.isArray(data.failed_rules)) {
      return data.failed_rules;
    } else if (typeof data === 'object') {
      // If it's an object, try to extract array values
      const arrayValues = Object.values(data).find(value => Array.isArray(value));
      if (arrayValues) {
        return arrayValues;
      }
      // If no arrays found, wrap the object in an array for processing
      return [data];
    }
  } else if (dataType === 'Network' || dataType === 'Process') {
    // Network and Process data handling
    if (Array.isArray(data)) {
      return data;
    } else if (data.results && Array.isArray(data.results)) {
      return data.results;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (typeof data === 'object') {
      // Convert object to processable format
      return [data];
    }
  }

  console.warn(`${dataType} data structure not recognized, using as-is`);
  return data;
};

  const getFileSize = (data: any): number => {
    return new Blob([JSON.stringify(data)]).size;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const createSmartSummary = (scaData: any): any => {
  // Validate that scaData is an array
  if (!Array.isArray(scaData)) {
    console.warn('SCA data is not an array, cannot create smart summary');
    return {
      error: 'Invalid SCA data format',
      metadata: {
        total_rules: 0,
        failed_rules: 0,
        passed_rules: 0,
        analysis_method: 'error_fallback'
      }
    };
  }
  
  // Since this is failed_results data, all entries are failed by default
  // Check for result field instead of status field
  const allRules = scaData.map(item => ({
    ...item,
    // Normalize the structure - extract rule data and add status
    rule_id: item.rule?.id || item.id,
    title: item.rule?.title || item.title,
    description: item.rule?.description || item.description,
    rationale: item.rule?.rationale || item.rationale,
    remediation: item.rule?.remediation || item.remediation,
    result: item.rule?.result || item.result || 'failed',
    status: 'failed' // Since this is failed_results, all are failed
  }));
  
  const criticalRules = allRules.filter(rule => 
    rule.rationale?.toLowerCase().includes('critical') || 
    rule.description?.toLowerCase().includes('critical') ||
    rule.rule_id?.toString().includes('1.1') ||
    rule.rule_id?.toString().includes('1.2') ||
    rule.rule_id?.toString().includes('2.1') ||
    rule.rule_id?.toString().includes('3.1') ||
    rule.rule_id?.toString().includes('4.1') ||
    rule.rule_id?.toString().includes('5.1')
  );

  const highPriorityRules = allRules.filter(rule => 
    !criticalRules.includes(rule) &&
    (rule.rationale?.toLowerCase().includes('high') ||
     rule.description?.toLowerCase().includes('authentication') ||
     rule.description?.toLowerCase().includes('encryption') ||
     rule.description?.toLowerCase().includes('firewall'))
  );

  const mediumPriorityRules = allRules.filter(rule => 
    !criticalRules.includes(rule) && 
    !highPriorityRules.includes(rule)
  );

  const compressRule = (rule: any) => ({
    rule_id: rule.rule_id,
    title: rule.title,
    description: rule.description?.substring(0, 200) + (rule.description?.length > 200 ? '...' : ''),
    rationale: rule.rationale?.substring(0, 150) + (rule.rationale?.length > 150 ? '...' : ''),
    remediation: rule.remediation?.substring(0, 200) + (rule.remediation?.length > 200 ? '...' : ''),
    status: rule.status,
    result: rule.result
  });

  const summary = {
    metadata: {
      total_rules: allRules.length,
      failed_rules: allRules.length, // All are failed since this is failed_results
      passed_rules: 0, // None passed since this is failed_results
      critical_failures: criticalRules.length,
      high_priority_failures: highPriorityRules.length,
      medium_priority_failures: mediumPriorityRules.length,
      analysis_method: 'smart_summary'
    },
    critical_rules: criticalRules.slice(0, 8).map(compressRule),
    high_priority_rules: highPriorityRules.slice(0, 6).map(compressRule),
    sample_medium_rules: mediumPriorityRules.slice(0, 4).map(compressRule),
    rule_categories: categorizeRules(allRules),
    compliance_overview: generateComplianceOverview(allRules)
  };

  return summary;
};

 const categorizeRules = (rules: any[]): { [key: string]: { total: number; failed: number; passed: number; failure_rate: string; } } => {
  if (!Array.isArray(rules)) {
    return {};
  }

  const categories = {
    'Initial Setup': rules.filter(r => r.rule_id?.toString().startsWith('1.')),
    'Services': rules.filter(r => r.rule_id?.toString().startsWith('2.')),
    'Network Configuration': rules.filter(r => r.rule_id?.toString().startsWith('3.')),
    'Logging and Auditing': rules.filter(r => r.rule_id?.toString().startsWith('4.')),
    'Access Control': rules.filter(r => r.rule_id?.toString().startsWith('5.')),
    'System Maintenance': rules.filter(r => r.rule_id?.toString().startsWith('6.'))
  };

  const categorySummary: { [key: string]: { total: number; failed: number; passed: number; failure_rate: string; } } = {};
  Object.entries(categories).forEach(([category, categoryRules]) => {
    categorySummary[category] = {
      total: categoryRules.length,
      failed: categoryRules.length, // All are failed in failed_results
      passed: 0, // None passed in failed_results
      failure_rate: categoryRules.length > 0 ? '100%' : '0%' // All failed
    };
  });

  return categorySummary;
};


  const generateComplianceOverview = (rules: any[]): any => {
  if (!Array.isArray(rules)) {
    return {
      total_rules: 0,
      passed_rules: 0,
      failed_rules: 0,
      compliance_score: '0%',
      risk_level: 'Unknown'
    };
  }

  const totalRules = rules.length;
  const failedRules = totalRules; // All are failed since this is failed_results
  const passedRules = 0; // None passed since this is failed_results
  
  return {
    total_rules: totalRules,
    passed_rules: passedRules,
    failed_rules: failedRules,
    compliance_score: '0%', // 0% since all rules in this data failed
    risk_level: failedRules > 50 ? 'Critical' : failedRules > 20 ? 'High' : failedRules > 10 ? 'Medium' : 'Low'
  };
};

  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const processScaInChunks = async (scaData: any[], makeApiRequest: Function): Promise<string> => {
  // Validate input data
  if (!Array.isArray(scaData)) {
    throw new Error('SCA data is not an array - cannot process in chunks');
  }

  // Since this is failed_results, all rules are failed
  const failedRules = scaData.map(item => ({
    ...item,
    rule_id: item.rule?.id || item.id,
    title: item.rule?.title || item.title,
    description: item.rule?.description || item.description,
    rationale: item.rule?.rationale || item.rationale,
    remediation: item.rule?.remediation || item.remediation,
    result: item.rule?.result || item.result || 'failed',
    status: 'failed'
  }));
  
  if (failedRules.length === 0) {
    return '## SCA Analysis\n\nNo failed rules found in the data. All compliance checks appear to be passing.';
  }

  const chunkSize = 8;
  const chunks = chunkArray(failedRules, chunkSize);
  
  setProcessingMetrics({
    totalRules: failedRules.length,
    processedRules: 0,
    batchCount: chunks.length,
    currentBatch: 0,
    estimatedTime: `${(chunks.length * 4)} seconds`,
    fileSize: formatFileSize(getFileSize(scaData))
  });

  let combinedAnalysis = '';
  let processedRules = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    setCurrentAnalysisStep(`Processing SCA batch ${i + 1}/${chunks.length} (${chunk.length} rules)`);
    
    setProcessingMetrics(prev => prev ? {
      ...prev,
      currentBatch: i + 1,
      processedRules: processedRules
    } : null);

    const compressedChunk = chunk.map(rule => ({
      rule_id: rule.rule_id,
      title: rule.title,
      description: rule.description?.substring(0, 150) + (rule.description?.length > 150 ? '...' : ''),
      rationale: rule.rationale?.substring(0, 100) + (rule.rationale?.length > 100 ? '...' : ''),
      remediation: rule.remediation?.substring(0, 150) + (rule.remediation?.length > 150 ? '...' : ''),
      status: rule.status,
      result: rule.result
    }));

    const chunkPrompt = `Analyze these ${compressedChunk.length} failed CIS compliance rules:

${JSON.stringify(compressedChunk, null, 2)}

For each rule provide:
1. Rule ID and brief issue summary
2. Risk level (Critical/High/Medium)
3. Quick remediation action
4. Business impact

Keep response concise and actionable.`;

    try {
      const chunkResult = await makeApiRequest(chunkPrompt, 'sca');
      combinedAnalysis += `### Batch ${i + 1} (Rules ${processedRules + 1}-${processedRules + chunk.length})\n\n`;
      combinedAnalysis += chunkResult + '\n\n';
      
      processedRules += chunk.length;
      setProcessingMetrics(prev => prev ? {
        ...prev,
        processedRules: processedRules
      } : null);

      if (i < chunks.length - 1) {
        await delay(4000);
      }
    } catch (error: unknown) {
      console.error(`SCA batch ${i + 1} failed:`, error);
      combinedAnalysis += `### Batch ${i + 1} - FAILED\n\nError: ${(error as Error).message}\n\n`;
    }
  }

  const summaryPrompt = `Summarize this CIS compliance analysis:

Total Failed Rules: ${failedRules.length}
Batches Processed: ${chunks.length}

Key findings from batches:
${combinedAnalysis.substring(0, 2000)}...

Provide:
1. Overall compliance score estimate
2. Top 5 critical issues
3. Quick wins
4. Priority remediation plan

Keep summary under 800 words.`;

  try {
    await delay(3000);
    const executiveSummary = await makeApiRequest(summaryPrompt, 'sca');
    return `## Executive Summary\n\n${executiveSummary}\n\n## Detailed Analysis\n\n${combinedAnalysis}`;
  } catch (error: unknown) {
    console.error('SCA executive summary failed:', error);
    return `## Executive Summary\n\nSummary generation failed: ${(error as Error).message}\n\n## Detailed Analysis\n\n${combinedAnalysis}`;
  }
};

  const categorizeAnalysisResult = (result: string): AnalysisResult => {
    const sections: AnalysisResult = {
      security: null,
      network: null,
      system: null,
      tools: null,
      executive: null
    };

    // Split the result into sections based on headers
    const lines = result.split('\n');
    let currentSection: keyof AnalysisResult | null = null;
    let currentContent: string[] = [];

    lines.forEach(line => {
      if (line.startsWith('# Executive Summary')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'executive';
        currentContent = [line];
      } else if (line.startsWith('## SCA Compliance Analysis')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'security';
        currentContent = [line];
      } else if (line.startsWith('## Network Security Analysis')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'network';
        currentContent = [line];
      } else if (line.startsWith('## Process Security Analysis')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = 'system';
        currentContent = [line];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  };

  const analyzeJsonFiles = async () => {
    setIsAnalyzing(true);
    setAnalysisResult({
      security: null,
      network: null,
      system: null,
      tools: null,
      executive: null
    });
    setProcessingMetrics(null);
    setAnalysisStatus({
      sca: 'pending',
      network: 'pending',
      process: 'pending'
    });
    
    const apiKeys = [
      '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',
      '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',
      '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'
    ];
    
    let keyRotationIndex = 0;
    let requestCount = 0;

    const makeApiRequest = async (prompt: string, analysisType: string): Promise<string> => {
      const maxRetries = apiKeys.length;
      let lastError;

      for (let retry = 0; retry < maxRetries; retry++) {
        const currentKeyIndex = (keyRotationIndex + retry) % apiKeys.length;
        const apiKey = apiKeys[currentKeyIndex];

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              max_tokens: 1800
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          
          requestCount++;
          if (requestCount % 10 === 0) {
            keyRotationIndex = (keyRotationIndex + 1) % apiKeys.length;
          }

          return data.choices[0].message.content;
        } catch (error) {
          console.error(`API request failed (key ${currentKeyIndex + 1}, retry ${retry + 1}):`, error);
          lastError = error;
          
          if (retry < maxRetries - 1) {
            await delay(2000 * (retry + 1));
          }
        }
      }

      throw lastError || new Error('All API keys exhausted');
    };
    
    try {
      let scaData, networkData, processData;
      
      // Load and validate SCA data
      try {
        const scaModule = await import('../components/wazuh/failed_sca_results_2025-06-10.json');
        const rawScaData = scaModule.default;
        scaData = validateAndNormalizeData(rawScaData, 'SCA');
        console.log('SCA data after validation:', scaData);
      } catch (error) {
        console.error('Failed to load SCA data:', error);
        scaData = { error: 'Failed to load SCA results data', data: [] };
      }

      // Load and validate Network data
      try {
        const networkModule = await import('../components/wazuh/network_ports_2025-06-10T10-17-03-444Z.json');
        const rawNetworkData = networkModule.default;
        networkData = validateAndNormalizeData(rawNetworkData, 'Network');
        console.log('Network data after validation:', networkData);
      } catch (error) {
        console.error('Failed to load network data:', error);
        networkData = { error: 'Failed to load network ports data', data: [] };
      }

      // Load and validate Process data
      try {
        const processModule = await import('../components/wazuh/processes_data_2025-06-10.json');
        const rawProcessData = processModule.default;
        processData = validateAndNormalizeData(rawProcessData, 'Process');
        console.log('Process data after validation:', processData);
      } catch (error) {
        console.error('Failed to load process data:', error);
        processData = { error: 'Failed to load process data', data: [] };
      }

      let combinedResult = '# Comprehensive Security Analysis Report\n\n';

      // SCA Analysis
      setAnalysisStatus(prev => ({ ...prev, sca: 'processing' }));
      setCurrentAnalysisStep('Analyzing SCA data structure...');

      try {
        let scaAnalysis = '';
        
        if (scaData.error) {
          scaAnalysis = `SCA Analysis Error: ${scaData.error}`;
        } else if (!Array.isArray(scaData)) {
          scaAnalysis = 'SCA Analysis Error: Data is not in the expected array format';
        } else {
          const scaFileSize = getFileSize(scaData);
          
          if (scaFileSize > 500 * 1024) {
            setCurrentAnalysisStep('Large SCA file detected - using smart summarization...');
            const smartSummary = createSmartSummary(scaData);
            
            if (smartSummary.error) {
              scaAnalysis = `SCA Analysis Error: ${smartSummary.error}`;
            } else {
              const estimatedTokens = estimateTokens(JSON.stringify(smartSummary));
              console.log(`Smart summary estimated tokens: ${estimatedTokens}`);
              
              if (estimatedTokens > 10000) {
                setCurrentAnalysisStep('Summary still too large - using ultra-compact analysis...');
                const ultraCompactSummary = {
                  metadata: smartSummary.metadata,
                  top_critical: smartSummary.critical_rules?.slice(0, 3) || [],
                  top_high: smartSummary.high_priority_rules?.slice(0, 2) || [],
                  categories: smartSummary.rule_categories,
                  overview: smartSummary.compliance_overview
                };
                
                const compactPrompt = `Analyze this ultra-compact CIS compliance summary:

${JSON.stringify(ultraCompactSummary, null, 2)}

Provide concise analysis:
1. Risk assessment (Critical/High/Medium/Low)
2. Top 3 urgent fixes needed
3. Compliance score interpretation
4. Next steps

Keep response under 500 words.`;

                scaAnalysis = await makeApiRequest(compactPrompt, 'sca');
              } else {
                const summaryPrompt = `Analyze this CIS compliance summary:

${JSON.stringify(smartSummary, null, 2)}

Provide comprehensive analysis:
1. Overall compliance assessment and risk level
2. Critical failures requiring immediate attention  
3. High-priority security gaps
4. Category-wise failure analysis
5. Prioritized remediation roadmap

Focus on actionable insights.`;

                scaAnalysis = await makeApiRequest(summaryPrompt, 'sca');
              }
            }
          } else if (scaData.length > 50) {
            setCurrentAnalysisStep('Processing SCA in optimized chunks...');
            scaAnalysis = await processScaInChunks(scaData, makeApiRequest);
          } else {
            setCurrentAnalysisStep('Processing SCA with standard analysis...');
            const estimatedTokens = estimateTokens(JSON.stringify(scaData));
            console.log(`Standard SCA estimated tokens: ${estimatedTokens}`);
            
            if (estimatedTokens > 10000) {
              setCurrentAnalysisStep('SCA file too large for standard analysis - switching to chunk processing...');
              scaAnalysis = await processScaInChunks(scaData, makeApiRequest);
            } else {
              const standardPrompt = `Analyze the following CIS compliance results:

${JSON.stringify(scaData, null, 2)}

Provide:
1. Summary of critical compliance failures
2. Risk level assessment  
3. Specific remediation steps for each failed rule
4. Priority ranking
5. Compliance score and recommendations

Format in clear, actionable language.`;

              scaAnalysis = await makeApiRequest(standardPrompt, 'sca');
            }
          }
        }

        setAnalysisStatus(prev => ({ ...prev, sca: 'completed' }));
        combinedResult += `## SCA Compliance Analysis\n\n${scaAnalysis}\n\n---\n\n`;
      } catch (error: unknown) {
        console.error('SCA analysis failed:', error);
        setAnalysisStatus(prev => ({ ...prev, sca: 'failed' }));
        combinedResult += `## SCA Compliance Analysis\n\nAnalysis failed: ${(error as Error).message}\n\n---\n\n`;
      }

      // Network Analysis
      setAnalysisStatus(prev => ({ ...prev, network: 'processing' }));
      setCurrentAnalysisStep('Analyzing network security...');

      try {
        let networkAnalysis = '';
        
        if (networkData.error) {
          networkAnalysis = `Network Analysis Error: ${networkData.error}`;
        } else {
          const networkPrompt = `Analyze the following network ports data for security risks:

${JSON.stringify(networkData, null, 2)}

Provide:
1. Analysis of open ports and security risks
2. Potentially dangerous services identification
3. Recommended port security configurations
4. Priority actions needed
5. Network hardening recommendations

Format in clear, actionable language.`;

          networkAnalysis = await makeApiRequest(networkPrompt, 'network');
        }

        setAnalysisStatus(prev => ({ ...prev, network: 'completed' }));
        combinedResult += `## Network Security Analysis\n\n${networkAnalysis}\n\n---\n\n`;
        await delay(3000);
      } catch (error: unknown) {
        console.error('Network analysis failed:', error);
        setAnalysisStatus(prev => ({ ...prev, network: 'failed' }));
        combinedResult += `## Network Security Analysis\n\nAnalysis failed: ${(error as Error).message}\n\n---\n\n`;
      }

      // Process Analysis
      setAnalysisStatus(prev => ({ ...prev, process: 'processing' }));
      setCurrentAnalysisStep('Analyzing process security...');

      try {
        let processAnalysis = '';
        
        if (processData.error) {
          processAnalysis = `Process Analysis Error: ${processData.error}`;
        } else {
          const processPrompt = `Analyze the following process data for security concerns:

${JSON.stringify(processData, null, 2)}

Provide:
1. Analysis of running processes and security implications
2. Identification of potentially risky processes
3. Resource usage and performance security analysis
4. Process hardening recommendations
5. Monitoring and alerting suggestions

Format in clear, actionable language.`;

          processAnalysis = await makeApiRequest(processPrompt, 'process');
        }

        setAnalysisStatus(prev => ({ ...prev, process: 'completed' }));
        combinedResult += `## Process Security Analysis\n\n${processAnalysis}\n\n---\n\n`;
        await delay(2000);
      } catch (error: unknown) {
        console.error('Process analysis failed:', error);
        setAnalysisStatus(prev => ({ ...prev, process: 'failed' }));
        combinedResult += `## Process Security Analysis\n\nAnalysis failed: ${(error as Error).message}\n\n---\n\n`;
      }

      // Generate executive summary
      const executiveSummaryPrompt = `Based on the following analysis, provide a concise executive summary:

${combinedResult}

Focus on:
1. Overall security posture
2. Critical findings
3. Immediate action items
4. Risk level assessment

Keep it under 300 words.`;

      try {
        const executiveSummary = await makeApiRequest(executiveSummaryPrompt, 'executive');
        combinedResult = `# Executive Summary\n\n${executiveSummary}\n\n---\n\n${combinedResult}`;
      } catch (error) {
        console.error('Executive summary generation failed:', error);
        combinedResult = `# Executive Summary\n\nFailed to generate executive summary: ${(error as Error).message}\n\n---\n\n${combinedResult}`;
      }

      // Update the categorization of results
      const categorizedResults = categorizeAnalysisResult(combinedResult);
      console.log('Setting analysis results:', categorizedResults);
      setAnalysisResult(categorizedResults);
      
    } catch (error: unknown) {
      console.error('Comprehensive analysis failed:', error);
      setAnalysisResult({
        security: null,
        network: null,
        system: null,
        tools: null,
        executive: `# Analysis Failed\n\nComprehensive analysis encountered an error: ${(error as Error).message}\n\nPossible causes:\n- API key issues or rate limits\n- Network connectivity problems  \n- JSON file loading errors\n- Token limit exceeded\n- Invalid data format\n\nPlease verify configuration and try again.`
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalysisStep('');
      setProcessingMetrics(null);
    }
  };

  const getStatusIcon = (status: AnalysisStatus[keyof AnalysisStatus]) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-neutral-400" />;
      case 'processing':
        return <div className="animate-spin w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
    }
  };

  const isLoading = loading.frameworks || loading.assessments || loading.tools;

  const criticalIssues = assessments
    .filter(a => a.status === 'completed')
    .flatMap(a => a.result?.findings || [])
    .filter(f => f.status !== 'compliant' && f.severity === 'critical')
    .length;

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'network', label: 'Network', icon: <Network size={16} /> },
    { id: 'system', label: 'System', icon: <Server size={16} /> },
    { id: 'tools', label: 'Tools', icon: <Settings size={16} /> },
  ];

  const formatAnalysisResult = (text: string): string => {
    if (!text) return '';
    
    // Special handling for executive summary
    if (text.startsWith('# Executive Summary')) {
      // Split into sections
      const sections = text.split('\n\n');
      let formattedText = '';
      
      // Format the title with a decorative line
      formattedText += `
        <div class="mb-8">
          <div class="text-2xl font-bold text-white mb-2">Executive Summary</div>
          <div class="h-1 w-20 bg-primary-500 rounded-full"></div>
        </div>
      `;
      
      // Format each section
      sections.slice(1).forEach(section => {
        if (section.trim()) {
          // Check if section starts with a numbered list
          if (/^\d+\./.test(section)) {
            formattedText += '<div class="space-y-4 mb-8">';
            section.split('\n').forEach(line => {
              if (line.trim()) {
                const match = line.match(/^(\d+)\.\s*(.*)/);
                if (match) {
                  formattedText += `
                    <div class="flex items-start gap-4 bg-neutral-900/50 p-4 rounded-lg">
                      <span class="text-primary-400 min-w-[1.5rem] font-medium text-lg">${match[1]}.</span>
                      <span class="text-neutral-300 leading-relaxed">${match[2]}</span>
                    </div>
                  `;
                }
              }
            });
            formattedText += '</div>';
          } else {
            // Regular paragraph with enhanced styling
            formattedText += `
              <div class="text-neutral-300 mb-8 leading-relaxed bg-neutral-900/50 p-6 rounded-lg">
                ${section
                  .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>')
                  .replace(/\n/g, '<br />')}
              </div>
            `;
          }
        }
      });
      
      // Add a summary box at the bottom
      formattedText += `
        <div class="mt-8 p-6 bg-neutral-900/50 rounded-lg border border-neutral-700">
          <div class="text-lg font-semibold text-white mb-4">Key Takeaways</div>
          <div class="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-primary-400">•</span>
              <span className="text-neutral-300">Overall security posture assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-400">•</span>
              <span className="text-neutral-300">Critical findings and immediate actions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-400">•</span>
              <span className="text-neutral-300">Risk level and compliance status</span>
            </div>
          </div>
        </div>
      `;
      
      return formattedText;
    }
    
    // Regular analysis formatting
    // Replace markdown headers with styled divs
    text = text.replace(/^# (.*$)/gm, '<div class="text-xl font-bold text-white mb-4">$1</div>');
    text = text.replace(/^## (.*$)/gm, '<div class="text-lg font-semibold text-white mt-6 mb-3">$1</div>');
    text = text.replace(/^### (.*$)/gm, '<div class="text-base font-medium text-white mt-4 mb-2">$1</div>');
    
    // Replace bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-white">$1</span>');
    
    // Format batch results with consistent styling
    text = text.replace(/\* Risk level:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-2 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Risk Level:</span> $1</span></div>');
    
    text = text.replace(/\* Quick remediation:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-2 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Quick Remediation:</span> $1</span></div>');
    
    text = text.replace(/\* Business impact:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-3 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Business Impact:</span> $1</span></div>');
    
    // Handle variations in the format
    text = text.replace(/\* Risk:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-2 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Risk Level:</span> $1</span></div>');
    
    text = text.replace(/\* Remediation:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-2 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Quick Remediation:</span> $1</span></div>');
    
    text = text.replace(/\* Impact:?\s*([^\n]*)/gi, 
      '<div class="flex items-start gap-3 mb-3 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1"><span class="font-medium text-white">Business Impact:</span> $1</span></div>');
    
    // Replace other bullet points with better spacing and styling
    text = text.replace(/^\* (.*$)/gm, '<div class="flex items-start gap-3 mb-3 pl-2"><span class="text-primary-400 mt-1.5">•</span><span class="flex-1">$1</span></div>');
    
    // Replace numbered lists with better spacing and styling
    text = text.replace(/^(\d+)\. (.*$)/gm, '<div class="flex items-start gap-3 mb-3 pl-2"><span class="text-primary-400 min-w-[1.5rem]">$1.</span><span class="flex-1">$2</span></div>');
    
    // Replace code blocks
    text = text.replace(/```(.*?)```/gs, '<div class="bg-neutral-900 p-3 rounded-lg my-4 font-mono text-sm">$1</div>');
    
    // Replace inline code
    text = text.replace(/`(.*?)`/g, '<code class="bg-neutral-900 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');
    
    // Add spacing between sections
    text = text.replace(/\n\n/g, '<div class="h-4"></div>');
    
    return text;
  };

  const generateExecutiveSummary = (assessments: any[], tools: any[]): string => {
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => a.status === 'completed').length;
    const totalFindings = assessments.flatMap(a => a.result?.findings || []);
    const criticalFindings = totalFindings.filter(f => f.severity === 'critical').length;
    const highFindings = totalFindings.filter(f => f.severity === 'high').length;
    const activeTools = tools.filter(t => t.status === 'active').length;
    const complianceRate = totalFindings.length > 0 ? 
      Math.round((totalFindings.filter(f => f.status === 'compliant').length / totalFindings.length) * 100) : 0;

    // Get the most recent assessment for timestamp
    const latestAssessment = assessments
      .filter(a => a.status === 'completed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    // Get top critical findings
    const topCriticalFindings = totalFindings
      .filter(f => f.severity === 'critical')
      .slice(0, 2)
      .map(f => f.title || f.description)
      .join(', ');

    const riskLevel = criticalFindings > 0 ? 'Critical' : highFindings > 5 ? 'High' : 'Moderate';
    const riskColor = criticalFindings > 0 ? 'text-red-400' : highFindings > 5 ? 'text-orange-400' : 'text-green-400';

    return `
      <p>
        Based on the latest security assessment (${latestAssessment ? new Date(latestAssessment.timestamp).toLocaleDateString() : 'N/A'}), 
        our HPC system's security posture requires ${riskLevel.toLowerCase()} attention. The analysis reveals 
        <strong>${criticalFindings}</strong> critical vulnerabilities and <strong>${highFindings}</strong> high-priority concerns, 
        with an overall compliance rate of <strong>${complianceRate}%</strong>. Key critical issues include: 
        <strong>${topCriticalFindings || 'None identified'}</strong>. 
        <strong>${activeTools}</strong> of <strong>${tools.length}</strong> security monitoring tools are actively protecting the system. 
        Risk level: <strong class="${riskColor}">${riskLevel}</strong>. 
        Immediate action is required to address critical vulnerabilities and strengthen security controls.
      </p>
    `;
  };

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
            {isAnalyzing ? 'Analyzing...' : 'Analyze Results'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-neutral-700">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isAnalyzing && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Progress</h3>
          {currentAnalysisStep && (
            <p className="text-primary-400 mb-4">{currentAnalysisStep}</p>
          )}
          
          {processingMetrics && (
            <div className="bg-neutral-900 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-primary-400" />
                <span className="text-sm font-medium text-white">Processing Metrics</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-300">
                <div>
                  <span className="text-neutral-400">Progress:</span>
                  <div className="font-medium">{processingMetrics.processedRules}/{processingMetrics.totalRules} rules</div>
                </div>
                <div>
                  <span className="text-neutral-400">Batch:</span>
                  <div className="font-medium">{processingMetrics.currentBatch}/{processingMetrics.batchCount}</div>
                </div>
                <div>
                  <span className="text-neutral-400">File Size:</span>
                  <div className="font-medium">{processingMetrics.fileSize}</div>
                </div>
                <div>
                  <span className="text-neutral-400">Est. Time:</span>
                  <div className="font-medium">{processingMetrics.estimatedTime}</div>
                </div>
              </div>
              <div className="mt-2 bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(processingMetrics.processedRules / processingMetrics.totalRules) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(analysisStatus.sca)}
              <span className="text-neutral-300">SCA Compliance Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(analysisStatus.network)}
              <span className="text-neutral-300">Network Security Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(analysisStatus.process)}
              <span className="text-neutral-300">Process Security Analysis</span>
            </div>
          </div>
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
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Executive Summary Section */}
              {analysisResult.executive && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                  <div  className="text-neutral-350 max-h-[600px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: formatAnalysisResult(
                          analysisResult.executive
                            .replace('# Executive Summary\n\n', '')
                            .replace(/^#.*\n/gm, '') // Remove any remaining headers
                            .trim()
                        ) 
                      }}
                    />
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => setAnalysisResult(prev => ({ ...prev, executive: null }))}
                      className="btn-outline text-sm"
                    >
                      Close Summary
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResult.executive || '')}
                      className="btn-secondary text-sm"
                    >
                      Copy Summary
                    </button>
                  </div>
                </div>
              )}

              {/* Overall Review Section */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary-400" />
                  Overall Review
                </h3>
                {(() => {
                  console.log('Analysis Result:', analysisResult);
                  return !analysisResult.executive ? (
                    <div className="text-center py-12">
                      <div className="text-neutral-400 mb-4">No analysis data available</div>
                      <button 
                        onClick={() => {
                          console.log('Analyze button clicked');
                          analyzeJsonFiles();
                        }}
                        disabled={isAnalyzing}
                      >                 
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Compliance Score Card */}
                      <div className="bg-neutral-900 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-neutral-400 mb-2">Compliance Score</h4>
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              <circle
                                className="text-neutral-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                              />
                              <circle
                                className="text-primary-500"
                                strokeWidth="8"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * (assessments.filter(a => a.status === 'completed').length / assessments.length))}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">
                                {Math.round((assessments.filter(a => a.status === 'completed').length / assessments.length) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Level Card */}
                      <div className="bg-neutral-900 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-neutral-400 mb-2">Risk Level</h4>
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${
                              criticalIssues > 0 ? 'text-red-400' : 
                              criticalIssues > 5 ? 'text-orange-400' : 
                              'text-green-400'
                            }`}>
                              {criticalIssues > 0 ? 'Critical' : criticalIssues > 5 ? 'High' : 'Low'}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {criticalIssues} Critical Issues
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Tools Card */}
                      <div className="bg-neutral-900 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-neutral-400 mb-2">Active Tools</h4>
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary-400 mb-2">
                              {tools.filter(t => t.status === 'active').length}
                            </div>
                            <div className="text-sm text-neutral-400">
                              of {tools.length} Tools Active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-3">
                  <ToolStatus tools={tools} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentAssessments assessments={assessments} frameworks={frameworks} />
                </div>
                <div>
                  <ThreatSummary assessments={assessments} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Security Analysis</h3>
              {analysisResult.security ? (
                <>
                  <div 
                    className="text-neutral-300 max-h-[600px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisResult(
                        analysisResult.security
                          .replace('# Executive Summary\n\n', '')
                          .replace(/^#.*\n/gm, '') // Remove any remaining headers
                          .trim()
                      ) 
                    }}
                  />
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => setAnalysisResult(prev => ({ ...prev, security: null }))}
                      className="btn-outline text-sm"
                    >
                      Close Summary
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResult.security || '')}
                      className="btn-secondary text-sm"
                    >
                      Copy Summary
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-neutral-400 text-center py-8">
                  No security analysis results available
                </div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Network Security</h3>
              {analysisResult.network ? (
                <>
                  <div 
                    className="text-neutral-300 max-h-[600px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisResult(
                        analysisResult.network
                          .replace('# Executive Summary\n\n', '')
                          .replace(/^#.*\n/gm, '') // Remove any remaining headers
                          .trim()
                      ) 
                    }}
                  />
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => setAnalysisResult(prev => ({ ...prev, network: null }))}
                      className="btn-outline text-sm"
                    >
                      Close Summary
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResult.network || '')}
                      className="btn-secondary text-sm"
                    >
                      Copy Summary
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-neutral-400 text-center py-8">
                  No network analysis results available
                </div>
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Analysis</h3>
              {analysisResult.system ? (
                <>
                  <div 
                    className="text-neutral-300 max-h-[600px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisResult(
                        analysisResult.system
                          .replace('# Executive Summary\n\n', '')
                          .replace(/^#.*\n/gm, '') // Remove any remaining headers
                          .trim()
                      ) 
                    }}
                  />
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => setAnalysisResult(prev => ({ ...prev, system: null }))}
                      className="btn-outline text-sm"
                    >
                      Close Summary
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResult.system || '')}
                      className="btn-secondary text-sm"
                    >
                      Copy Summary
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-neutral-400 text-center py-8">
                  No system analysis results available
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Active Tools</h3>
                <div className="space-y-4">
                  {tools.map(tool => (
                    <div key={tool.id} className="bg-neutral-900 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{tool.name}</h4>
                          <p className="text-sm text-neutral-400">{tool.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          tool.status === 'active' ? 'bg-success-900 text-success-400' :
                          tool.status === 'error' ? 'bg-error-900 text-error-400' :
                          'bg-neutral-700 text-neutral-300'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-neutral-400">
                        <span>Version: {tool.version}</span>
                        {tool.lastRun && (
                          <span>Last Run: {new Date(tool.lastRun).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tool Analysis</h3>
                <div className="text-neutral-300 max-h-[600px] overflow-y-auto">
                  <div className="space-y-6">
                    <div className="bg-neutral-900/50 p-6 rounded-lg">
                      <h4 className="text-lg font-medium text-white mb-4">Security Scanning Tools Overview</h4>
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <span className="text-primary-400 mt-1.5">•</span>
                          <div>
                            <span className="font-medium text-white">Wazuh</span>
                            <p className="text-neutral-300 mt-1">
                              A comprehensive security monitoring platform that provides:
                              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-400">
                                <li>Real-time threat detection and incident response</li>
                                <li>Advanced log analysis and correlation</li>
                                <li>File integrity monitoring and system hardening</li>
                                <li>Vulnerability detection and compliance monitoring</li>
                                <li>Cloud security monitoring and container security</li>
                              </ul>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary-400 mt-1.5">•</span>
                          <div>
                            <span className="font-medium text-white">OpenSCAP</span>
                            <p className="text-neutral-300 mt-1">
                              An automated security compliance and vulnerability assessment tool that offers:
                              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-400">
                                <li>Automated vulnerability scanning and compliance checking</li>
                                <li>Support for multiple security standards (CIS, NIST, PCI-DSS)</li>
                                <li>Detailed security policy enforcement</li>
                                <li>Comprehensive reporting and remediation guidance</li>
                                <li>Integration with security management systems</li>
                              </ul>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-primary-400 mt-1.5">•</span>
                          <div>
                            <span className="font-medium text-white">Lynis</span>
                            <p className="text-neutral-300 mt-1">
                              A powerful security auditing and system hardening tool that provides:
                              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-400">
                                <li>Comprehensive system security auditing</li>
                                <li>Detailed security hardening recommendations</li>
                                <li>Compliance checking against security standards</li>
                                <li>Vulnerability scanning and system health checks</li>
                                <li>Custom security profiles and policy enforcement</li>
                              </ul>
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-neutral-700">
                          <h5 className="text-sm font-medium text-white mb-3">Integration Benefits</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-neutral-800/50 p-4 rounded-lg">
                              <span className="text-primary-400 text-sm font-medium">Comprehensive Coverage</span>
                              <p className="text-neutral-400 text-sm mt-1">Combined capabilities provide end-to-end security monitoring and assessment</p>
                            </div>
                            <div className="bg-neutral-800/50 p-4 rounded-lg">
                              <span className="text-primary-400 text-sm font-medium">Automated Compliance</span>
                              <p className="text-neutral-400 text-sm mt-1">Continuous monitoring and enforcement of security standards</p>
                            </div>
                            <div className="bg-neutral-800/50 p-4 rounded-lg">
                              <span className="text-primary-400 text-sm font-medium">Real-time Protection</span>
                              <p className="text-neutral-400 text-sm mt-1">Immediate threat detection and response capabilities</p>
                            </div>
                            <div className="bg-neutral-800/50 p-4 rounded-lg">
                              <span className="text-primary-400 text-sm font-medium">Detailed Reporting</span>
                              <p className="text-neutral-400 text-sm mt-1">Comprehensive security insights and actionable recommendations</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {analysisResult.tools && (
                      <div className="bg-neutral-900/50 p-6 rounded-lg">
                        <h4 className="text-lg font-medium text-white mb-4">Analysis Results</h4>
                        <div 
                          className="text-neutral-300"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAnalysisResult(
                              analysisResult.tools
                                .replace('# Executive Summary\n\n', '')
                                .replace(/^#.*\n/gm, '')
                                .trim()
                            ) 
                          }}
                        />
                        <div className="mt-4 flex gap-2">
                          <button 
                            onClick={() => setAnalysisResult(prev => ({ ...prev, tools: null }))}
                            className="btn-outline text-sm"
                          >
                            Close Summary
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(analysisResult.tools || '')}
                            className="btn-secondary text-sm"
                          >
                            Copy Summary
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;