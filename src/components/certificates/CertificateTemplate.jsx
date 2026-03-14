import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Shield, Sparkles } from 'lucide-react';

const CertificateTemplate = React.forwardRef(({ doc, resident, barangay }, ref) => {
  if (!doc || !resident || !barangay) return null;

  const typeTitles = {
    barangay_clearance: 'BARANGAY CLEARANCE',
    certificate_of_residency: 'CERTIFICATE OF RESIDENCY',
    certificate_of_indigency: 'CERTIFICATE OF INDIGENCY',
    good_moral_certificate: 'CERTIFICATE OF GOOD MORAL CHARACTER',
    business_clearance: 'BARANGAY BUSINESS CLEARANCE'
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('default', { month: 'long' });

  // Add th/st/nd/rd logic for day
  const getOrdinalSuffix = (i) => {
    let j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
  };

  return (
    <div ref={ref} className="bg-white text-black w-[8.5in] h-[11in] mx-auto relative printable-certificate font-serif shadow-2xl border border-gray-200 overflow-hidden box-border">
      
      {/* Absolute Border Frame */}
      <div className="absolute inset-4 border-[12px] border-double border-[#1B4F72] rounded-xl pointer-events-none z-10"></div>
      <div className="absolute inset-5 border-[1px] border-[#1B4F72] rounded-lg pointer-events-none z-10"></div>
      
      {/* Background Watermark/Logo Placeholder Overlay */}
      <div className="absolute inset-0 flex justify-center items-center opacity-[0.05] pointer-events-none z-0 mt-32">
        <img 
          src="https://tse1.mm.bing.net/th/id/OIP.9qXwf94ibttqWtZHaEa1NAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
          alt="Watermark Logo" 
          className="w-[500px] h-[500px] object-contain grayscale"
        />
      </div>

      {/* Main Content Container (Padded inside the border) */}
      <div className="relative z-20 h-full p-16 flex flex-col">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-6">
          {/* Left Logo - LGU/Republic */}
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#F39C12] flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden">
             <div className="text-center">
                 <Sparkles className="w-8 h-8 mx-auto text-[#F39C12]" />
                 <span className="text-[10px] font-sans font-bold leading-none mt-1 block">LGU LOGO</span>
             </div>
          </div>
          
          {/* Center Text */}
          <div className="text-center flex-1 px-4">
            <p className="text-sm tracking-widest font-bold font-sans">REPUBLIC OF THE PHILIPPINES</p>
            <p className="text-sm italic mb-2 tracking-wide">Province of Occidental Mindoro</p>
            <p className="text-sm font-bold tracking-wide">Municipality of Mamburao</p>
            <h2 className="text-2xl font-black text-[#1B4F72] uppercase mt-3 tracking-[0.2em] w-full border-b-2 border-t-2 border-[#1B4F72] py-2">
              BARANGAY {barangay.barangay_name}
            </h2>
            <p className="text-xs mt-2 text-gray-800 font-sans tracking-[0.3em] font-bold">OFFICE OF THE PUNONG BARANGAY</p>
          </div>

          {/* Right Logo - Barangay */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-transparent flex-shrink-0 relative overflow-hidden">
             <img 
               src="https://tse1.mm.bing.net/th/id/OIP.9qXwf94ibttqWtZHaEa1NAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
               alt="Barangay Logo" 
               className="w-full h-full object-cover"
               crossOrigin="anonymous"
             />
          </div>
        </div>

        {/* DOCUMENT TITLE */}
        <div className="mt-8 mb-10 text-center relative">
           <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#1B4F72]/50 to-transparent"></div>
           <span className="relative bg-white px-6 inline-block">
             <h1 className="text-4xl font-extrabold text-gray-900 font-serif tracking-widest shrink-0 shadow-sm drop-shadow-sm">
               {typeTitles[doc.document_type] || 'CERTIFICATION'}
             </h1>
           </span>
        </div>

        {/* GREETING */}
        <div className="text-xl font-bold mb-6 tracking-wide">TO WHOM IT MAY CONCERN:</div>

        {/* BODY TEXT */}
        <div className="text-lg leading-loose text-justify indent-16 flex-1 drop-shadow-sm">
          {doc.document_type === 'certificate_of_indigency' && (
            <p>
              This is to certify that <strong className="uppercase underline decoration-dotted underline-offset-4 mx-1 px-1">{resident.first_name} {resident.middle_name ? resident.middle_name.charAt(0) + '.' : ''} {resident.last_name} {resident.suffix || ''}</strong>, 
              of legal age, {resident.civil_status}, and a permanent, bonafide resident of <strong className="mx-1">{resident.Household?.address || 'this barangay'}</strong>, 
              is personally known to me to be a person of good moral character and a law-abiding citizen in the community.
              <br/><br/>
              <span className="indent-16 block">
                 This certification is being issued upon the request of the interested party to attest to the fact that their family belongs to the <strong className="mx-1">indigent sector</strong> of this barangay, 
                 for the purpose of <strong className="uppercase border-b border-black inline-block min-w-[150px] px-1 text-center">{doc.purpose}</strong> and for whatever legal intent it may serve.
              </span>
            </p>
          )}

          {doc.document_type === 'barangay_clearance' && (
            <p>
              This is to certify that <strong className="uppercase underline decoration-dotted underline-offset-4 mx-1 px-1">{resident.first_name} {resident.middle_name ? resident.middle_name.charAt(0) + '.' : ''} {resident.last_name} {resident.suffix || ''}</strong>, 
              of legal age, civil status {resident.civil_status}, and a bonafide resident of <strong className="mx-1">{resident.Household?.address || 'this barangay'}</strong>, 
              has <strong className="uppercase tracking-wide">no derogatory record</strong> on file in this office as of this date.
              <br/><br/>
              <span className="indent-16 block">
                  This clearance is being issued upon the request of the above-named person for <strong className="uppercase border-b border-black inline-block min-w-[200px] px-1 text-center">{doc.purpose}</strong> 
                  and for whatever legal purpose it may serve him/her best.
              </span>
            </p>
          )}

          {doc.document_type === 'certificate_of_residency' && (
            <p>
              This is to certify that <strong className="uppercase underline decoration-dotted underline-offset-4 mx-1 px-1">{resident.first_name} {resident.middle_name ? resident.middle_name.charAt(0) + '.' : ''} {resident.last_name} {resident.suffix || ''}</strong>, 
              is a permanent and bonafide resident of <strong className="uppercase mx-1">{resident.Household?.address || 'this barangay'}</strong>, 
              Municipality of Mamburao, Province of Occidental Mindoro.
              <br/><br/>
              <span className="indent-16 block">
                 This certification is issued upon the request of the interested party in connection with his/her application for <strong className="uppercase border-b border-black inline-block min-w-[200px] px-1 text-center">{doc.purpose}</strong> and for whatever legal requirement it may serve.
              </span>
            </p>
          )}
          
          {doc.document_type === 'good_moral_certificate' && (
            <p>
              This is to certify that <strong className="uppercase underline decoration-dotted underline-offset-4 mx-1 px-1">{resident.first_name} {resident.middle_name ? resident.middle_name.charAt(0) + '.' : ''} {resident.last_name} {resident.suffix || ''}</strong>, 
              a resident of <strong className="uppercase mx-1">{resident.Household?.address || 'this barangay'}</strong>, 
              is a person of <strong className="uppercase tracking-wide">good moral character</strong>, has a peaceful disposition, and is a law-abiding citizen of this barangay.
              <br/><br/>
              <span className="indent-16 block">
                 This clearance/certification is being issued upon the request of said person for <strong className="uppercase border-b border-black inline-block min-w-[200px] px-1 text-center">{doc.purpose}</strong>.
              </span>
            </p>
          )}
        </div>

        {/* ISSUANCE DATE */}
        <div className="text-lg leading-loose mt-8 mb-16">
          <span className="indent-16 block">
            Issued this <strong className="underline underline-offset-4 px-1">{day}<sup>{getOrdinalSuffix(day)}</sup></strong> day of <strong className="underline underline-offset-4 px-1 uppercase">{month}, {currentYear}</strong> at 
            the Office of the Punong Barangay, {barangay.barangay_name}, Mamburao, Occidental Mindoro, Philippines.
          </span>
        </div>

        {/* SIGNATURES & OFFICIAL SEAL INDICATOR */}
        <div className="flex justify-between items-end mt-10">
          
          {/* Left Side: Dry Seal & Ledger Data */}
          <div className="w-1/3">
             <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center opacity-60 mb-6 relative group">
                <span className="text-xs text-gray-400 font-sans text-center px-2 tracking-widest font-bold rotate-[-15deg]">AFFIX DRY SEAL HERE</span>
             </div>
             
             <div className="text-xs font-sans border border-gray-300 p-3 bg-gray-50/50">
                <div className="mb-1 grid grid-cols-[80px_1fr] border-b border-gray-200 pb-1">
                   <strong>O.R. No:</strong> <span className="text-[#1B4F72] font-mono">{doc.or_number || '______________'}</span>
                </div>
                <div className="mb-1 grid grid-cols-[80px_1fr] border-b border-gray-200 pb-1">
                   <strong>Amt Paid:</strong> <span className="font-mono">₱ {doc.amount_paid || '0.00'}</span>
                </div>
                <div className="mb-1 grid grid-cols-[80px_1fr] border-b border-gray-200 pb-1">
                   <strong>Doc No:</strong> <span className="font-mono text-gray-500">{doc.request_number}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] pt-1">
                   <strong>Date:</strong> <span>{formatDate(doc.createdAt)}</span>
                </div>
             </div>
          </div>

          {/* Right Side: Punong Barangay Signature */}
          <div className="w-5/12 text-center pb-4">
            <div className="border-b-2 border-black pb-1 mb-1 relative">
                {/* Simulated Signature */}
                <div className="absolute bottom-1 w-full text-center flex justify-center -z-10 opacity-30">
                     <span className="font-serif italic text-4xl transform -rotate-6 text-[#1B4F72]">Approved</span>
                </div>
                <h3 className="font-black font-sans text-xl uppercase tracking-wider">{barangay.captain_name || 'HON. JUAN DELA CRUZ'}</h3>
            </div>
            <div className="text-sm tracking-widest font-bold text-gray-800">PUNONG BARANGAY</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">Not valid without official dry seal</div>
          </div>

        </div>

        {/* DOCUMENT FOOTER MARGIN */}
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
           <span className="text-[8px] font-mono text-gray-400">System Generated Document | CRPS Mamburao | {doc.request_number}</span>
        </div>

      </div>
    </div>
  );
});

export default CertificateTemplate;
