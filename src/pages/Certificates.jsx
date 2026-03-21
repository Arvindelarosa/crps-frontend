import toast from 'react-hot-toast';
import React, { useEffect, useState, useRef } from 'react';
import { FileText, Printer, Search, PlusCircle, CheckCircle2, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { documentsAPI, residentsAPI } from '../api';
import { useAuthStore } from '../store';
import { formatDate } from '../utils/formatters';
import CertificateTemplate from '../components/certificates/CertificateTemplate';
import Modal from '../components/ui/Modal';
import CertificateForm from '../components/certificates/CertificateForm';

const Certificates = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // react-to-print v3 requires contentRef (not content: () => ref)
  const certificateRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: certificateRef,
    documentTitle: selectedDoc ? `Certificate_${selectedDoc.request_number}` : 'Certificate',
    onAfterPrint: () => {
      setSelectedDoc(null);
      setSelectedResident(null);
      setIsPrinting(false);
    },
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentsAPI.getAll();
      if (res.data.success) setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const loadResident = async (residentId) => {
    try {
      const res = await residentsAPI.getById(residentId);
      return res.data.success ? res.data.data : null;
    } catch {
      toast.error('Error loading resident details.');
      return null;
    }
  };

  const preparePrint = async (doc) => {
    setIsPrinting(true);
    const resident = await loadResident(doc.resident_id);
    if (!resident) { setIsPrinting(false); return; }
    setSelectedDoc(doc);
    setSelectedResident(resident);
    // Use requestAnimationFrame to wait for React to render the ref'd template
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        handlePrint();
      });
    });
  };

  const handleDownloadPDF = async (doc) => {
    setIsPrinting(true);
    const resident = await loadResident(doc.resident_id);
    if (!resident) { setIsPrinting(false); return; }
    setSelectedDoc(doc);
    setSelectedResident(resident);

    // Wait for React to render the CertificateTemplate into the ref
    await new Promise(r => setTimeout(r, 400));

    try {
      const el = certificateRef.current;
      if (!el) { 
        toast.error('Certificate template could not be loaded. Please try again.');
        setIsPrinting(false); 
        return; 
      }

      // Temporarily bring the off-screen element to a renderable position
      const container = el.parentElement;
      const prevStyle = container ? container.getAttribute('style') : null;
      if (container) {
        container.setAttribute('style', 
          'position:fixed;top:0;left:0;z-index:9999;opacity:1;pointer-events:none;'
        );
      }

      // Allow browser to re-paint in the new position
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(el, { 
        scale: 1.5, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff', 
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // 1. Remove SVG elements that cause 0x0 canvas createPattern errors
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            const w = svg.getAttribute('width') || svg.style.width || svg.clientWidth;
            const h = svg.getAttribute('height') || svg.style.height || svg.clientHeight;
            const size = Math.max(parseInt(w || '0'), parseInt(h || '0'));
            
            if (size > 100 || svg.closest('[class*="opacity-"]')) {
              svg.remove();
            } else {
              // Ensure remaining SVGs have explicit dimensions to avoid 0x0 issues
              svg.style.width = w + 'px';
              svg.style.height = h + 'px';
            }
          });

          // 2. Prevent 'createPattern' 0 width/height errors from borders
          const patternedEls = clonedDoc.querySelectorAll(
            '[class*="border-dashed"], [class*="border-dotted"], [class*="border-double"], [class*="decoration-dotted"]'
          );
          patternedEls.forEach(el => {
            el.classList.remove('border-dashed', 'border-dotted', 'border-double', 'decoration-dotted');
            el.classList.add('border-solid', 'decoration-solid');
            el.style.setProperty('border-style', 'solid', 'important');
            el.style.setProperty('text-decoration-style', 'solid', 'important');
          });

          // 3. Prevent 'createPattern' errors from gradients (renderBackgroundImage)
          const gradientEls = clonedDoc.querySelectorAll('[class*="bg-gradient-"]');
          gradientEls.forEach(el => {
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });
          
          // Force all elements with 0 width/height to have at least 1px or remove their backgrounds
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

      // Restore hidden position
      if (container) {
        if (prevStyle) container.setAttribute('style', prevStyle);
        else container.setAttribute('style', 'position:fixed;top:-9999px;left:-9999px;z-index:-1;pointer-events:none;');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${doc.request_number}_${doc.document_type}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      toast.error(`Failed to generate PDF: ${err.message}\n\nPlease use the Print button instead.`);
    } finally {
      setSelectedDoc(null);
      setSelectedResident(null);
      setIsPrinting(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    if (currentStatus === 'released') return;
    const newStatus = currentStatus === 'pending' ? 'processing' : 'released';
    let or = null;
    if (newStatus === 'released') {
      or = window.prompt('Enter O.R. Number (Optional):');
    }
    try {
      await documentsAPI.updateStatus(id, newStatus, or);
      fetchDocs();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (status) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (status === 'processing') return 'bg-blue-100 text-blue-800 border border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">Certificates & Clearances</h1>
          <p className="text-sm text-gray-500">Manage and print official barangay documents</p>
        </div>
        <button className="btn btn-primary bg-[#1B4F72] hover:bg-[#154360] border-none" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} /> New Request
        </button>
      </div>

      <div className="card p-5 shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request No.</th>
                  <th>Resident</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono text-[13px] font-semibold text-[#1B4F72]">{d.request_number}</td>
                    <td className="font-semibold text-gray-800 uppercase text-[12px]">
                      {d.Resident?.last_name}, {d.Resident?.first_name}
                    </td>
                    <td className="capitalize text-slate-700 font-medium text-[13px]">
                      {d.document_type.replace(/_/g, ' ')}
                    </td>
                    <td className="text-[12px] text-gray-500 truncate max-w-[130px] italic" title={d.purpose}>{d.purpose}</td>
                    <td>
                      <span className={`status-badge ${statusBadge(d.status)}`}>
                        {d.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {d.status !== 'released' && (
                          <button
                            className="btn btn-sm btn-ghost border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleUpdateStatus(d.id, d.status)}
                          >
                            <CheckCircle2 size={13} /> Update
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-ghost border-slate-200 text-slate-700 hover:bg-slate-50"
                          onClick={() => handleDownloadPDF(d)}
                          disabled={isPrinting}
                          title="Download as PDF"
                        >
                          <Download size={13} /> PDF
                        </button>
                        <button
                          className="btn btn-sm btn-primary bg-[#1B4F72] hover:bg-[#154360] border-none"
                          onClick={() => preparePrint(d)}
                          disabled={isPrinting}
                        >
                          <Printer size={13} /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500 bg-slate-50/50">
                      <FileText size={36} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No document requests yet.</p>
                      <p className="text-sm text-slate-400">Click "New Request" to generate a certificate.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Off-screen print target - must NOT use display:none (breaks react-to-print) */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, pointerEvents: 'none' }}>
        {selectedDoc && selectedResident && user?.Barangay && (
          <CertificateTemplate
            ref={certificateRef}
            doc={selectedDoc}
            resident={selectedResident}
            barangay={user.Barangay}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Document Request" size="md">
        <CertificateForm onSuccess={() => { setIsModalOpen(false); fetchDocs(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Certificates;
