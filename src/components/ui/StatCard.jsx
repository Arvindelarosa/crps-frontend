import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  return (
    <div className={`card p-6 stat-card-${color} text-white relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        {Icon && (
          <div className="bg-white/20 p-3 rounded-xl">
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 text-white/10" style={{ transform: 'rotate(-15deg)' }}>
        {Icon && <Icon size={120} />}
      </div>
    </div>
  );
};

export default StatCard;
