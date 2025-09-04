import React, { useState, useEffect } from 'react';
import { Twitter, Youtube, Instagram, Facebook, ExternalLink, RefreshCw, AlertTriangle, MapPin, Clock, Users } from 'lucide-react';
import { socialMediaApi } from '../services/api';
import type { SocialMediaPostProperties, GeoJSONFeature, FloodEventProperties, GeoJSONPolygon } from '../types';

interface SocialMediaAlertsProps {
  className?: string;
}

const SocialMediaAlerts: React.FC<SocialMediaAlertsProps> = ({ className = '' }) => {
  const [posts, setPosts] = useState<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await socialMediaApi.getFloodRelevant();
      // Handle different response formats
      const postsData = Array.isArray(response) ? response : (response.data || []);
      setPosts(postsData);
    } catch (err) {
      setError('Failed to load social media alerts');
      console.error('Social media fetch error:', err);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await socialMediaApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStats()]);
    setRefreshing(false);
  };

  const triggerScrape = async () => {
    try {
      setRefreshing(true);
      // This would trigger a new scrape - you might want to add this endpoint
      await handleRefresh();
    } catch (err) {
      console.error('Scrape trigger error:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'news':
        return <AlertTriangle className="w-4 h-4" />;
      case 'reddit':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'text-blue-500 bg-blue-50';
      case 'youtube':
        return 'text-red-500 bg-red-50';
      case 'instagram':
        return 'text-pink-500 bg-pink-50';
      case 'facebook':
        return 'text-blue-600 bg-blue-50';
      case 'news':
        return 'text-green-600 bg-green-50';
      case 'reddit':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-600 bg-red-100';
    if (confidence >= 0.6) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading social media alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Social Media Flood Alerts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time flood reports from social media platforms
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={triggerScrape}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              New Scrape
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total_posts}</div>
              <div className="text-sm text-blue-600">Total Posts</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.flood_relevant_posts}</div>
              <div className="text-sm text-orange-600">Flood Relevant</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.processed_posts}</div>
              <div className="text-sm text-green-600">Processed</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.relevance_rate * 100)}%
              </div>
              <div className="text-sm text-purple-600">Relevance Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {(!posts || posts.length === 0) ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No flood alerts found</h3>
            <p className="text-gray-600">
              No flood-related posts detected from social media platforms.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getPlatformColor(post.properties.social_media_source || 'news')}`}>
                      {getPlatformIcon(post.properties.social_media_source || 'news')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        @{post.properties.author_username || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(post.properties.detected_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(post.properties.confidence)}`}>
                      {Math.round(post.properties.confidence * 100)}% confidence
                    </span>
                    {post.properties.post_url && (
                      <a
                        href={post.properties.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">{post.properties.name}</h4>
                  {post.properties.post_content && (
                    <p className="text-gray-800 leading-relaxed">{post.properties.post_content}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {post.properties.engagement_score > 0 && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {post.properties.engagement_score} engagement
                      </div>
                    )}
                    {post.properties.location_description && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {post.properties.location_description}
                      </div>
                    )}
                    {post.properties.severity_level && (
                      <div className="flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {post.properties.severity_display || post.properties.severity_level}
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    Source: {post.properties.source_display || post.properties.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaAlerts;

