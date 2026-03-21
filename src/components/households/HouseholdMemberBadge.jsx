import React from 'react';
import { Crown, User } from 'lucide-react';

const HouseholdMemberBadge = ({ members }) => {
  if (!members || members.length === 0) {
    return <span className="text-gray-400 text-xs italic">No members</span>;
  }

  const head = members.find(m => m.is_household_head);
  const headName = head ? `${head.first_name} ${head.last_name}` : 'No Head Assigned';
  const memberCount = members.length;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
        <Crown size={14} className="text-[#F39C12]" />
        {headName}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <User size={12} />
        {memberCount} member{memberCount !== 1 ? 's' : ''} total
      </div>
    </div>
  );
};

export default HouseholdMemberBadge;
