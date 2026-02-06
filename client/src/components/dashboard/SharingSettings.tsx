import { useState, useEffect } from 'react';
import { Share2, Copy, Trash2, Eye, Edit, Check, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SharedLink {
  token: string;
  accessLevel: 'view' | 'edit';
  createdAt: string;
  expiresAt: string;
}

export default function SharingSettings() {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');

  useEffect(() => {
    fetchSharedLinks();
  }, []);

  const fetchSharedLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/sharing/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinks(response.data.links || []);
    } catch (error) {
      console.error('Failed to fetch shared links:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (accessLevel: 'view' | 'edit') => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/sharing/generate`,
        { accessLevel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newLink = {
        token: response.data.shareToken,
        accessLevel: response.data.accessLevel,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      setLinks([...links, newLink]);

      // Copy to clipboard
      const fullLink = response.data.shareLink;
      navigator.clipboard.writeText(fullLink);
      setCopiedToken(response.data.shareToken);
      setTimeout(() => setCopiedToken(''), 3000);

      alert(`${accessLevel === 'edit' ? 'Editing' : 'View-only'} link created and copied to clipboard!\n\nLink: ${fullLink}`);
    } catch (error) {
      console.error('Failed to generate link:', error);
      alert('Failed to generate share link');
    } finally {
      setGenerating(false);
    }
  };

  const revokeLink = async (token: string) => {
    if (!confirm('Are you sure you want to revoke this link? Anyone with this link will lose access.')) {
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/sharing/${token}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setLinks(links.filter((l) => l.token !== token));
      alert('Link revoked successfully');
    } catch (error) {
      console.error('Failed to revoke link:', error);
      alert('Failed to revoke link');
    }
  };

  const copyLink = (token: string) => {
    const fullLink = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <Share2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Wedding Dashboard</h3>
            <p className="text-gray-700 text-sm mb-4">
              Create shareable links so family and friends can view or help edit your wedding plans without creating
              an account. Links expire after 90 days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => generateLink('view')}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Create View-Only Link
              </button>
              <button
                onClick={() => generateLink('edit')}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
              >
                <Edit className="w-4 h-4" />
                Create Editing Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Links */}
      {links.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Shared Links</h3>
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.token}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {link.accessLevel === 'edit' ? (
                      <Edit className="w-4 h-4 text-green-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-blue-600" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        link.accessLevel === 'edit' ? 'text-green-700' : 'text-blue-700'
                      }`}
                    >
                      {link.accessLevel === 'edit' ? 'Can Edit' : 'View Only'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <LinkIcon className="w-3 h-3" />
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      {window.location.origin}/shared/{link.token.substring(0, 16)}...
                    </code>
                  </div>
                  <p className="text-xs text-gray-100 mt-1 drop-shadow-md">
                    Created: {new Date(link.createdAt).toLocaleDateString()} • Expires:{' '}
                    {new Date(link.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(link.token)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                    title="Copy link"
                  >
                    {copiedToken === link.token ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => revokeLink(link.token)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                    title="Revoke link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
          <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No active shared links</p>
          <p className="text-sm text-gray-100 mt-1 drop-shadow-md">Create a link above to share your dashboard</p>
        </div>
      )}
    </div>
  );
}
