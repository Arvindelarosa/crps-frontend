import React, { useState, useRef } from 'react';
import { CreditCard, Search, Printer, AlertCircle, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { qrAPI, residentsAPI } from '../api';
import { useAuthStore } from '../store';
import IDCardTemplate from '../components/qr/IDCardTemplate';

const BarangayID = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [resident, setResident] = useState(null);
  const [idData, setIdData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState('');

  // react-to-print v3: use contentRef
  const idCardRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: idCardRef,
    documentTitle: resident ? `Barangay_ID_${resident.resident_code}` : 'Barangay_ID',
    onAfterPrint: () => {},
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setErrorSearch('');
    setResident(null);
    setIdData(null);
    try {
      const res = await residentsAPI.getAll({ search: searchTerm });
      if (res.data.success && res.data.data.length > 0) {
        setResident(res.data.data[0]);
      } else {
        setErrorSearch('No resident found with that name or code.');
      }
    } catch {
      setErrorSearch('Failed to search residents.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateID = async () => {
    if (!resident) return;
    setLoading(true);
    try {
      const res = await qrAPI.generateId(resident.id);
      if (res.data.success) {
        setIdData(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already')) {
        // Try to fetch existing ID
        alert('An active ID already exists for this resident. Fetching existing ID...');
        try {
          const fetch = await qrAPI.getExistingId(resident.id);
          if (fetch?.data?.success) setIdData(fetch.data.data);
        } catch {
          setErrorSearch('Could not retrieve existing ID. Contact your system administrator.');
        }
      } else {
        alert(msg || 'Failed to generate ID.');
        setErrorSearch(msg || 'ID generation failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resident || !idData) { 
      alert('Please generate the ID card first before downloading.'); 
      return; 
    }
    const el = idCardRef.current;
    if (!el) { alert('ID card is not rendered yet.'); return; }
    
    try {
      // Temporarily remove any CSS transform scale so html2canvas captures at full resolution
      const wrapper = el.parentElement;
      let prevTransform = '';
      if (wrapper) {
        prevTransform = wrapper.style.transform || '';
        // Set scale immediately and synchronously
        wrapper.style.transform = 'scale(1)';
        wrapper.style.transition = 'none';
      }
      
      // Allow browser minimal time to recalculate layout synchronously
      await new Promise(r => setTimeout(r, 100));
      setLoading(true);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // ID cards look better with actual white background
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Remove SVG elements that cause 0x0 canvas errors
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            const w = svg.getAttribute('width') || svg.style.width || svg.clientWidth || '0';
            const h = svg.getAttribute('height') || svg.style.height || svg.clientHeight || '0';
            const size = Math.max(parseInt(w), parseInt(h));
            
            if (size > 80 || svg.closest('[class*="opacity-"]')) {
              svg.remove();
            } else {
              svg.style.width = w + 'px';
              svg.style.height = h + 'px';
            }
          });

          // Prevent createPattern 0 width errors from borders
          const patternedEls = clonedDoc.querySelectorAll(
            '[class*="border-dashed"], [class*="border-dotted"], [class*="border-double"]'
          );
          patternedEls.forEach(el => {
            el.classList.remove('border-dashed', 'border-dotted', 'border-double');
            el.classList.add('border-solid');
            el.style.setProperty('border-style', 'solid', 'important');
          });

          // Prevent createPattern errors from backgrounds
          const gradientEls = clonedDoc.querySelectorAll('[class*="bg-gradient-"]');
          gradientEls.forEach(el => {
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });

          // Remove empty backgrounds causing 0 width canvas crashes
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                 el.style.setProperty('background-image', 'none', 'important');
              }
            }
          });
        },
      });
      
      // Restore transform
      if (wrapper) {
        wrapper.style.transform = prevTransform;
        wrapper.style.transition = '';
      }
      
      const imgData = canvas.toDataURL('image/png');
      // ID Card: landscape, ~215.9mm x 139.7mm (half letter page landscape) 
      const pdf = new jsPDF('l', 'mm', [215.9, 139.7]);
      pdf.addImage(imgData, 'PNG', 0, 0, 215.9, 139.7);
      pdf.save(`BrgyID_${resident.resident_code}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert(`PDF generation failed: ${err.message}\n\nPlease use the Print button instead.`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResident(null);
    setIdData(null);
    setSearchTerm('');
    setErrorSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Barangay Identifications</h1>
          <p className="text-sm text-gray-500">Generate and print official Barangay ID cards with QR verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search & Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Search size={18} className="text-[#1B4F72]" /> Find Resident
            </h3>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Resident Name or Code</label>
                <div className="relative">
                  <input
                    type="text"
                    className="form-input w-full pr-10"
                    placeholder="Enter name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-3 bg-gray-100 border-l border-gray-200 rounded-r-md hover:bg-gray-200 text-gray-600"
                    disabled={loading}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {errorSearch && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorSearch}</span>
                </div>
              )}
            </form>

            {resident && (
              <div className="mt-6 pt-4 border-t border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#1B4F72]/10 rounded-full flex items-center justify-center text-[#1B4F72] font-bold text-lg">
                    {resident.first_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 leading-tight">
                      {resident.first_name} {resident.last_name}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">{resident.resident_code}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {!idData ? (
                    <button
                      onClick={handleGenerateID}
                      className="w-full btn btn-primary bg-[#1B4F72] hover:bg-[#154360] border-none justify-center"
                      disabled={loading}
                    >
                      <CreditCard size={18} /> Generate ID Card & QR
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handlePrint}
                        className="w-full btn btn-success justify-center"
                      >
                        <Printer size={18} /> Print ID Card
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full btn btn-ghost border-slate-200 justify-center"
                        disabled={loading}
                      >
                        <Download size={18} /> Download as PDF
                      </button>
                    </div>
                  )}

                  <button
                    onClick={resetScanner}
                    className="w-full btn btn-ghost justify-center"
                  >
                    Cancel / Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="card shadow-sm border border-gray-100 h-full bg-[#f8fafc] flex flex-col">
            <h3 className="font-semibold text-gray-800 p-4 border-b border-gray-200 bg-white m-0 shrink-0">
              ID Card Preview
            </h3>
            <div className="flex-1 p-6 flex items-center justify-center overflow-auto min-h-[400px]">
              {loading ? (
                <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
              ) : resident ? (
                <div className="scale-[0.8] origin-top md:scale-90 lg:scale-100 transition-transform">
                  <IDCardTemplate
                    ref={idCardRef}
                    resident={resident}
                    barangay={user?.Barangay || {}}
                    qrData={idData?.qr_data || idData?.qr_content}
                    idData={idData}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Search and select a resident to preview the ID card</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarangayID;
