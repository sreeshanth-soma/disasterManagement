import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { GeoJSONFeature, VictimReportProperties, GeoJSONPoint } from '../types';
import '../styles/ReportCard.css';

interface ReportCardProps {
  report: GeoJSONFeature<VictimReportProperties, GeoJSONPoint>;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const { properties } = report;

  return (
    <div className="report-card-container">
      <div className="card" onClick={onClick}>
        <span className="icon">
          <AlertTriangle />
        </span>
        <h4>Report #{report.id} - {properties.emergency_type || 'General Emergency'}</h4>
        <p>
          <strong>Name:</strong> {properties.name || 'Anonymous'}<br/>
          <strong>Contact:</strong> {properties.phone || 'N/A'}<br/>
          <strong>Location:</strong> {properties.address || properties.location || 'N/A'}
        </p>
        <div className="shine"></div>
        <div className="background">
          <div className="tiles">
            <div className="tile tile-1"></div>
            <div className="tile tile-2"></div>
            <div className="tile tile-3"></div>
            <div className="tile tile-4"></div>
            <div className="tile tile-5"></div>
            <div className="tile tile-6"></div>
            <div className="tile tile-7"></div>
            <div className="tile tile-8"></div>
            <div className="tile tile-9"></div>
            <div className="tile tile-10"></div>
          </div>
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
