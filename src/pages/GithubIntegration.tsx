import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'githubIntegrationDetails';

const GithubIntegration: React.FC = () => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load from local storage
    const savedDetails = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDetails) {
      const { owner, repo, token } = JSON.parse(savedDetails);
      setOwner(owner);
      setRepo(repo);
      setToken(token || '');
      setSaved(true);
    }
  }, []);

  useEffect(() => {
    if (saved && owner && repo) {
      fetchWorkflowRuns();
    }
    // eslint-disable-next-line
  }, [saved, owner, repo, token]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ owner, repo, token }));
    setSaved(true);
    setError('');
  };

  const handleClear = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setOwner('');
    setRepo('');
    setToken('');
    setSaved(false);
    setRuns([]);
    setError('');
  };

  const fetchWorkflowRuns = async () => {
    setLoading(true);
    setError('');
    setRuns([]);
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
        headers: token ? { Authorization: `token ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch workflow runs');
      const data = await res.json();
      setRuns(data.workflow_runs || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching workflow runs');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">GitHub Integration</h1>
      <form onSubmit={handleSave} className="bg-neutral-900 p-4 rounded-lg mb-6 border border-neutral-800">
        <div className="mb-4">
          <label className="block text-neutral-300 mb-1">GitHub Owner/Org</label>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-neutral-300 mb-1">Repository Name</label>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
            value={repo}
            onChange={e => setRepo(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-neutral-300 mb-1">Personal Access Token (optional, for private repos)</label>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-800 text-white"
            value={token}
            onChange={e => setToken(e.target.value)}
            type="password"
            autoComplete="off"
          />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-outline" onClick={handleClear}>Clear</button>
        </div>
      </form>
      {saved && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Latest Workflow Runs</h2>
          {loading ? (
            <div className="text-neutral-400">Loading workflow runs...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : runs.length === 0 ? (
            <div className="text-neutral-400">No workflow runs found.</div>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {runs.slice(0, 5).map(run => (
                <li key={run.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-200">{run.name}</span>
                      <span className="ml-2 text-xs text-neutral-500">{new Date(run.created_at).toLocaleString()}</span>
                      <div className="text-sm text-neutral-400">Status: {run.status} | Conclusion: {run.conclusion || 'N/A'}</div>
                      <div className="text-xs text-neutral-500">Commit: {run.head_commit?.message}</div>
                    </div>
                    <a
                      href={run.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-xs ml-4"
                    >
                      View on GitHub
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GithubIntegration; 