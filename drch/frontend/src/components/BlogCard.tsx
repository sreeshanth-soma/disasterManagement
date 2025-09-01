import React from 'react';
import '../styles/BlogCard.css';

interface BlogCardProps {
  title: string;
  description: string;
  imageUrl: string;
  details?: string;
  onClick?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  details, 
  onClick 
}) => {
  return (
    <div className="blog-card" onClick={onClick}>
      <img 
        className="blog-img" 
        src={imageUrl} 
        alt={title}
        onError={(e) => {
          // Fallback to a default image if the provided image fails to load
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center';
        }}
      />
      <div className="text-overlay">
        <h2>{title}</h2>
        <p>
          {description}
          {details && (
            <>
              &nbsp;&nbsp;
              <a href="#" className="read-more" onClick={(e) => e.preventDefault()}>
                Read More
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
