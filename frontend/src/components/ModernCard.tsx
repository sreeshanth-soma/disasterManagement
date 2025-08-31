import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  icon?: LucideIcon;
  statusIcon?: React.ReactNode;
  timestamp?: string;
  location?: string;
  details?: Array<{ label: string; value: string | React.ReactNode }>;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>;
  tags?: Array<{ label: string; color?: string }>;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  status,
  priority,
  confidence,
  icon: Icon,
  statusIcon,
  timestamp,
  location,
  details = [],
  actions = [],
  tags = [],
  onClick,
  className = '',
  isSelected = false,
}) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'triaged': return 'bg-orange-100 text-orange-800';
      case 'rescued': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'flooded': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`
        group relative bg-white rounded-xl shadow-sm border border-gray-200
        hover:shadow-lg hover:border-gray-300 transition-all duration-300
        transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-300 shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {statusIcon}
            {priority && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority)}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            )}
            {status && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Confidence Bar */}
        {confidence && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Confidence</span>
              <span className="font-medium text-gray-900">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  confidence >= 0.8 ? 'bg-green-500' :
                  confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Timestamp and Location */}
        {(timestamp || location) && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            {timestamp && (
              <span>📅 {new Date(timestamp).toLocaleString()}</span>
            )}
            {location && (
              <span>📍 {location}</span>
            )}
          </div>
        )}

        {/* Details */}
        {details.length > 0 && (
          <div className="mb-3">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{detail.label}:</span>
                <span className="text-gray-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  tag.color || 'bg-blue-100 text-blue-800'
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  action.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  action.variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                  'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ModernCard;
