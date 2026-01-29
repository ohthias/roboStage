'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Play, Clock, Users, BarChart2 } from 'lucide-react';

const DashboardPreview: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20">
      <div className="relative rounded-2xl bg-base-200 border border-base-300 shadow-2xl overflow-hidden group">
        
        {/* Mockup Header */}
        <div className="h-10 bg-base-300 border-b border-base-300 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/50"></div>
            <div className="w-3 h-3 rounded-full bg-warning/50"></div>
            <div className="w-3 h-3 rounded-full bg-success/50"></div>
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-4 py-1 rounded bg-base-200 text-xs text-base-content/50 font-mono">
              app.showlive.com/event/final-regional
            </div>
          </div>
        </div>

        {/* Mockup Body - Abstract UI */}
        <div className="p-6 grid grid-cols-12 gap-6 bg-base-200/50 backdrop-blur-sm">
          
          {/* Sidebar */}
          <div className="hidden md:block col-span-2 space-y-4">
            <div className="h-8 w-24 bg-base-300 rounded animate-pulse"></div>
            <div className="space-y-2 mt-8">
               <div className="flex items-center gap-2 text-primary bg-primary/10 p-2 rounded">
                  <Play size={16} /> <div className="h-2 w-16 bg-primary/50 rounded"></div>
               </div>
               <div className="flex items-center gap-2 text-base-content/50 p-2">
                  <Clock size={16} /> <div className="h-2 w-16 bg-base-300 rounded"></div>
               </div>
               <div className="flex items-center gap-2 text-base-content/50 p-2">
                  <Users size={16} /> <div className="h-2 w-16 bg-base-300 rounded"></div>
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-base-300 rounded"></div>
              <div className="h-8 w-24 bg-primary rounded"></div>
            </div>

            {/* Scoreboard Cards */}
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`bg-base-300 p-4 rounded-xl border border-base-300 flex flex-col gap-2 relative overflow-hidden transition-all duration-700 ease-out transform ${
                    visible 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-90 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <BarChart2 size={40} />
                  </div>
                  <div className="h-3 w-20 bg-base-content/20 rounded"></div>
                  <div className="h-8 w-12 bg-base-content/10 rounded"></div>
                  <div className="w-full bg-base-content/20 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-primary h-full w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Area */}
            <div className="bg-base-300 rounded-xl border border-base-300 h-48 w-full p-4 space-y-3">
              <div className="h-4 w-full bg-base-content/30 rounded"></div>
              <div className="h-4 w-full bg-base-content/20 rounded"></div>
              <div className="h-4 w-full bg-base-content/20 rounded"></div>
              <div className="h-4 w-full bg-base-content/20 rounded"></div>
              <div className="h-4 w-3/4 bg-base-content/20 rounded"></div>
            </div>
          </div>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent opacity-60"></div>
      </div>
      
      {/* Decorative Elements behind dashboard */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 -z-10"></div>
    </div>
  );
};

export default DashboardPreview;