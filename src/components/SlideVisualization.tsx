import React, { useRef, useEffect } from 'react';
import { Maximize2, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SlideVisualizationProps {
  slideHTML: string;
  title: string;
}

export const SlideVisualization: React.FC<SlideVisualizationProps> = ({ slideHTML, title }) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useEffect(() => {
    if (slideRef.current && slideHTML) {
      slideRef.current.innerHTML = slideHTML;
    }
  }, [slideHTML]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      slideRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    if (slideRef.current) {
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-slide.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleShare = () => {
    // In production, this would generate a shareable link
    const shareData = {
      title: title,
      text: 'Check out this data insight!',
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!slideHTML) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Presentation Slide</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
        <div
          ref={slideRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            transformOrigin: 'top left',
            transform: isFullscreen ? 'none' : 'scale(1)'
          }}
        />
      </div>
    </div>
  );
};