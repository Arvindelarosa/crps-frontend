import React from 'react';

const Badge = ({ children, className = '', variant = 'default', ...props }) => {
  let bg = 'bg-gray-100 text-gray-800';
  if (variant === 'success') bg = 'bg-green-100 text-green-800';
  if (variant === 'danger') bg = 'bg-red-100 text-red-800';
  if (variant === 'warning') bg = 'bg-yellow-100 text-yellow-800';
  if (variant === 'primary') bg = 'bg-blue-100 text-blue-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
