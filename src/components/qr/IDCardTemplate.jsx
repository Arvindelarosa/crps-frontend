import React from 'react';
import QRCode from 'react-qr-code';
import { formatDate } from '../../utils/formatters';

const IDCardTemplate = React.forwardRef(({ resident, barangay, qrData, idData }, ref) => {
  if (!resident || !barangay) return null;

  return (
    <div ref={ref} className="w-[800px] flex gap-4 p-8 bg-gray-50 printable-id-card mx-auto">
      
      {/* Front of ID */}
      <div className="w-[340px] h-[540px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#1B4F72] h-24 flex items-center justify-center text-center p-3 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#154360] to-[#2E86C1] opacity-90 z-0"></div>
          <div className="relative z-10 w-full">
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest text-center leading-tight">Republic of the Philippines</p>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest text-center leading-tight">Mamburao, Occ. Mindoro</p>
            <h2 className="text-xl font-black text-[#F39C12] mt-1 text-center tracking-wide">BRGY. {barangay.barangay_name.toUpperCase()}</h2>
            <p className="text-[11px] text-white font-semibold tracking-wider text-center bg-black/20 py-0.5 mt-1 rounded">OFFICIAL BARANGAY ID</p>
          </div>
        </div>

        {/* Photo Area */}
        <div className="flex justify-center -mt-10 relative z-20">
          <div className="w-32 h-32 bg-gray-100 rounded-lg border-4 border-white shadow-md overflow-hidden flex flex-col items-center justify-center">
            {resident.photo_url ? (
              <img src={resident.photo_url} alt="Resident" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-xs text-center p-2">
                <span className="block text-2xl mb-1">📷</span>
                1x1 Photo
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-3 text-center">
          <h1 className="text-xl font-bold text-gray-900 leading-tight uppercase">
            {resident.last_name}, {resident.first_name} {resident.middle_name ? resident.middle_name.charAt(0) + '.' : ''} {resident.suffix || ''}
          </h1>
          
          <div className="mt-4 space-y-2 text-left">
            <div className="flex text-xs border-b border-gray-100 pb-1">
              <span className="w-20 text-gray-500 font-medium">Address:</span>
              <span className="font-semibold text-gray-800 break-words flex-1 leading-tight">{(resident.Household?.address) || resident.full_address || 'N/A'}</span>
            </div>
            <div className="flex text-xs border-b border-gray-100 pb-1">
              <span className="w-20 text-gray-500 font-medium">Birthdate:</span>
              <span className="font-semibold text-gray-800 flex-1">{formatDate(resident.birthdate)}</span>
            </div>
            <div className="flex text-xs border-b border-gray-100 pb-1">
              <span className="w-20 text-gray-500 font-medium">Blood Type:</span>
              <span className="font-semibold text-gray-800 flex-1 text-red-600">{resident.blood_type || 'N/A'}</span>
            </div>
            <div className="flex text-xs pb-1">
              <span className="w-20 text-gray-500 font-medium">ID Number:</span>
              <span className="font-bold text-[#1B4F72] flex-1 font-mono tracking-wider">{idData?.id_number || 'PENDING'}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 w-full flex flex-col items-center">
          <div className="w-40 border-b border-black text-center mb-1">
            <img src="/signature-placeholder.png" alt="" className="h-8 mx-auto opacity-0" />
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Signature</span>
        </div>
      </div>

      {/* Back of ID */}
      <div className="w-[340px] h-[540px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative flex flex-col">
        <div className="bg-[#1B4F72] h-1 w-full"></div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase border-b border-gray-200 pb-1">In case of emergency, please notify:</h3>
            <div className="mt-2 text-xs">
              <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 mb-1">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold w-2/3 text-left border-b border-gray-200 truncate">{resident.emergency_contact_name || ''}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 mb-1">
                <span className="text-gray-500">Address:</span>
                <span className="font-semibold w-2/3 text-left border-b border-gray-200 truncate">{resident.emergency_contact_address || ''}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500">Contact No:</span>
                <span className="font-semibold w-2/3 text-left border-b border-gray-200">{resident.emergency_contact_number || ''}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mb-4">
            <div className="bg-white p-2 border-2 border-[#1B4F72] rounded-lg shadow-sm">
              <QRCode
                value={qrData || 'pending'}
                size={140}
                level="H"
                className="w-full h-full"
              />
            </div>
            <p className="text-[9px] text-gray-500 mt-2 text-center max-w-[200px]">
              Scan to verify authenticity. This QR code is strictly for official use only.
            </p>
          </div>

          <div className="mt-auto text-center pt-2">
            <div className="w-48 border-b-2 border-black mx-auto mb-1">
              <div className="h-10"></div> {/* Punong Barangay Signature */}
            </div>
            <span className="text-[11px] font-bold text-gray-900 uppercase block tracking-wider">{barangay.captain_name || 'PUNONG BARANGAY'}</span>
            <span className="text-[10px] text-gray-500">Punong Barangay</span>
          </div>
        </div>

        <div className="bg-gray-100 p-2 text-center border-t border-gray-200">
          <p className="text-[8px] text-gray-500 font-medium leading-tight text-center max-w-[280px] mx-auto">
            This card is non-transferable and remains the property of Barangay {barangay.barangay_name}. 
            If found, please surrender to the Barangay Hall. Valid for 3 years from date of issue.
          </p>
        </div>
      </div>
    </div>
  );
});

export default IDCardTemplate;
