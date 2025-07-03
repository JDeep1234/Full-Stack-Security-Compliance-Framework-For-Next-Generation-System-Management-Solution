import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Cpu, Clock, Download, Database } from 'lucide-react';

interface ProcessesTableProps {
  processes: any[];
}

interface ProcessData {
  timestamp: string;
  totalProcesses: number;
  processes: any[];
}

const ProcessesTable: React.FC<ProcessesTableProps> = ({ processes }) => {
  const [processHistory, setProcessHistory] = useState<ProcessData[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Store process data in real-time
  useEffect(() => {
    if (processes && processes.length > 0 && isRecording) {
      const newEntry: ProcessData = {
        timestamp: new Date().toISOString(),
        totalProcesses: processes.length,
        processes: [...processes] // Deep copy to avoid reference issues
      };

      setProcessHistory(prev => {
        const updated = [...prev, newEntry];
        // Keep only last 100 entries to prevent memory issues
        return updated.slice(-100);
      });
    }
  }, [processes, isRecording]);

  // Auto-save functionality (optional)
  useEffect(() => {
    if (isRecording && processHistory.length > 0) {
      intervalRef.current = setInterval(() => {
        // This could trigger additional saves if needed
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, processHistory]);

  // Function to download JSON data
  const downloadJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalEntries: processHistory.length,
      data: processHistory
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processes_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to clear stored data
  const clearData = () => {
    setProcessHistory([]);
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (!processes || processes.length === 0) {
    return (
      <div className="card h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Running Processes</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-neutral-500">
              <Database className="h-4 w-4" />
              <span>{processHistory.length} records</span>
            </div>
            <button
              onClick={downloadJSON}
              disabled={processHistory.length === 0}
              className="p-2 rounded bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-700 disabled:cursor-not-allowed"
              title="Download JSON data"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-center text-neutral-500 py-8">
          No process information available
        </div>
      </div>
    );
  }

  // Sort processes by CPU usage (if available) or by name
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.cpu_usage !== undefined && b.cpu_usage !== undefined) {
      return parseFloat(b.cpu_usage) - parseFloat(a.cpu_usage);
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  // Format process state to be more readable
  const formatProcessState = (state: string) => {
    const states: Record<string, string> = {
      R: 'Running',
      S: 'Sleeping',
      D: 'Disk Sleep',
      Z: 'Zombie',
      T: 'Stopped',
      t: 'Tracing Stop',
      X: 'Dead',
      P: 'Parked'
    };
    
    return states[state] || state;
  };

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 text-primary-500 mr-2" />
          <h2 className="text-lg font-medium text-white">Running Processes</h2>
        </div>
        
        {/* Control Panel */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-neutral-400">
            <Database className="h-4 w-4" />
            <span>{processHistory.length} records</span>
          </div>
          
          <button
            onClick={toggleRecording}
            className={`px-3 py-1 rounded text-xs font-medium ${
              isRecording 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-neutral-600 hover:bg-neutral-700 text-neutral-300'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '● REC' : '○ STOP'}
          </button>
          
          <button
            onClick={downloadJSON}
            disabled={processHistory.length === 0}
            className="p-2 rounded bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-700 disabled:cursor-not-allowed"
            title="Download JSON data"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={clearData}
            disabled={processHistory.length === 0}
            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-xs"
            title="Clear stored data"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">Name</th>
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">PID</th>
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">State</th>
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">CPU</th>
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">Memory</th>
              <th className="text-left py-2 px-3 text-neutral-400 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {sortedProcesses.slice(0, 20).map((process, index) => (
              <tr 
                key={`${process.pid}-${index}`} 
                className="border-b border-neutral-800 hover:bg-background-light"
              >
                <td className="py-2 px-3 text-neutral-300 truncate max-w-[160px]" title={process.name || ''}>
                  {process.name || 'Unknown'}
                </td>
                <td className="py-2 px-3 text-neutral-400">
                  {process.pid || 'N/A'}
                </td>
                <td className="py-2 px-3 text-neutral-400">
                  {process.state ? formatProcessState(process.state) : 'N/A'}
                </td>
                <td className="py-2 px-3 text-neutral-400">
                  {process.cpu_usage ? `${process.cpu_usage}%` : 'N/A'}
                </td>
                <td className="py-2 px-3 text-neutral-400">
                  {process.memory_usage ? `${process.memory_usage}%` : 'N/A'}
                </td>
                <td className="py-2 px-3 text-neutral-400">
                  {process.priority !== undefined ? process.priority : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-neutral-500">
        <div className="flex items-center">
          <Cpu className="h-4 w-4 mr-1" />
          <span>Top 20 processes shown</span>
          {processes.length > 20 && (
            <span className="ml-2 text-neutral-400">({processes.length} total)</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Real-time data from agent</span>
          </div>
          {isRecording && (
            <div className="flex items-center text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Info */}
      {processHistory.length > 0 && (
        <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <div>
              <span className="font-medium">Data Collection:</span>
              <span className="ml-2">
                {processHistory.length} snapshots captured
              </span>
            </div>
            <div>
              <span className="font-medium">Latest:</span>
              <span className="ml-2">
                {processHistory[processHistory.length - 1]?.timestamp 
                  ? new Date(processHistory[processHistory.length - 1].timestamp).toLocaleTimeString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessesTable;