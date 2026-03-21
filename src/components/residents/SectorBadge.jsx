import React from 'react';

const sectorConfig = {
  is_senior_citizen: { label: 'Senior Citizen', color: 'badge-senior' },
  is_pwd: { label: 'PWD', color: 'badge-pwd' },
  is_solo_parent: { label: 'Solo Parent', color: 'badge-soloparent' },
  is_registered_voter: { label: 'Registered Voter', color: 'badge-voter' },
  is_student: { label: 'Student', color: 'badge-student' },
  is_4ps_beneficiary: { label: '4Ps', color: 'badge-4ps' },
  is_ofw: { label: 'OFW', color: 'badge-ofw' },
  is_indigenous_people: { label: 'Indigenous', color: 'badge-ip' },
  is_unemployed: { label: 'Unemployed', color: 'badge-unemployed' },
};

const SectorBadge = ({ sectorKey, customLabel }) => {
  const config = sectorConfig[sectorKey];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 mt-1 mr-1 rounded text-[10px] font-medium tracking-wide border ${config.color}`}>
      {customLabel || config.label}
    </span>
  );
};

export const getResidentSectors = (resident) => {
  const activeSectors = [];
  Object.keys(sectorConfig).forEach(key => {
    if (resident[key] === 1 || resident[key] === true) {
      activeSectors.push(key);
    }
  });
  return activeSectors;
};

export default SectorBadge;
