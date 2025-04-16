import React from 'react';

const StatCards: React.FC = () => {
  const stats = [
    { 
      id: 'files', 
      value: '345', 
      label: 'Files Uploaded',
      percentComplete: 52, // Only this stat has percentComplete
      icon: '📊'
    },
    { 
      id: 'students', 
      value: '67', 
      label: 'Active students',
      icon: '👨‍🎓'
    },
    { 
      id: 'uploads', 
      value: '12', 
      label: 'Uploads',
      icon: '📁'
    },
    { 
      id: 'audit', 
      value: '42', 
      label: 'Audit Trail',
      icon: '📋'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Storage Usage Card with Progress */}
      {stats[0].percentComplete !== undefined && (
        <div className="bg-white rounded-lg p-4 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div className="relative">
              {/* Circular progress bar */}
              <div className="w-20 h-20">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-gray-200" 
                    strokeWidth="10" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-green-400" 
                    strokeWidth="10" 
                    fill="transparent"
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * stats[0].percentComplete / 100)} 
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold">
                  {stats[0].percentComplete}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats[0].value}</div>
              <div className="text-sm text-gray-500">{stats[0].label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Stat Cards */}
      {stats.slice(1).map(stat => (
        <div key={stat.id} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              {stat.icon}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;