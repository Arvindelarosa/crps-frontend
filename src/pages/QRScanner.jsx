import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, UserCheck, ShieldAlert, List, RotateCcw } from 'lucide-react';
import { qrAPI } from '../api';
import { formatDate } from '../utils/formatters';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const scannerRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await qrAPI.getVisitorLog();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    // Initialize QR Scanner
    const scanner = new Html5QrcodeScanner('reader', { 
      qrbox: { width: 250, height: 250 }, 
      fps: 10,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0], // 0 = Camera scan only
    }, false); // verbose=false
    
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText) {
      if (loading) return;
      handleScan(decodedText);
      scanner.clear(); // Stop scanning temporarily
    }

    function onScanFailure(error) {
      // Ignore background scan failures
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [loading]); // Re-init might be needed if state logic gets complex, simplified for demo

  const handleScan = async (qrContent) => {
    setLoading(true);
    setScanError('');
    try {
      const res = await qrAPI.scan({ qr_content: qrContent });
      if (res.data.success) {
        setScanResult(res.data.data);
        fetchLogs(); // refresh the table
      }
    } catch (err) {
      setScanError(err.response?.data?.message || 'Invalid QR Code or Scan Error');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError('');
    // Scanner automatically re-renders based on useEffect clean/setup if we trigger a re-mount
    // For simplicity, we just reload the page in this demo setup to cleanly re-init the camera
    window.location.reload(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl text-gray-800 font-bold">QR Scanner & Visitor Log</h1>
          <p className="text-sm text-gray-500">Scan Barangay IDs for automated monitoring and logging</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scanner Section */}
        <div className="card p-5 shadow-sm border border-gray-100 w-full">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <QrCode size={18} className="text-[#1B4F72]" /> Scan ID Card
          </h3>

          <div style={{ display: (scanResult || scanError) ? 'none' : 'block' }}>
             <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg border-2 border-dashed border-[#2E86C1]/50 bg-gray-50"></div>
          </div>

          {scanResult && (
            <div className="animate-fade-in text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-green-800 mb-1">Access Logged!</h4>
              <p className="text-sm text-green-600 font-medium mb-4">Resident verified successfully.</p>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 text-left mb-6">
                <div className="text-sm border-b border-gray-100 pb-2 mb-2">
                  <span className="text-gray-500 block text-xs">Resident Name</span>
                  <span className="font-semibold text-gray-800">{scanResult.resident.first_name} {scanResult.resident.last_name}</span>
                </div>
                <div className="text-sm border-b border-gray-100 pb-2 mb-2">
                  <span className="text-gray-500 block text-xs">Resident Code</span>
                  <span className="font-mono text-gray-800">{scanResult.resident.resident_code}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 block text-xs">Action Recorded</span>
                  <span className="font-semibold text-[#1B4F72] uppercase tracking-wide">{(scanResult.scan_type || 'Unknown').replace('_', ' ')}</span>
                </div>
              </div>

              <button onClick={resetScanner} className="btn btn-success px-8 w-full justify-center">
                <RotateCcw size={16} /> Scan Next
              </button>
            </div>
          )}

          {scanError && (
            <div className="animate-fade-in text-center p-6 bg-red-50 rounded-xl border border-red-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h4 className="text-xl font-bold text-red-800 mb-2">Verification Failed</h4>
              <p className="text-red-600 mb-6">{scanError}</p>
              <button onClick={resetScanner} className="btn btn-danger px-8 w-full justify-center">
                <RotateCcw size={16} /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* Logs Section */}
        <div className="card shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <h3 className="font-semibold text-gray-800 p-5 pb-4 border-b border-gray-100 flex items-center gap-2 shrink-0">
            <List size={18} className="text-[#1B4F72]" /> Recent Scans
          </h3>
          
          <div className="flex-1 overflow-y-auto p-0 m-0">
            <table className="data-table w-full">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Resident</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(log.scan_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {log.Resident?.first_name} {log.Resident?.last_name}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${log.scan_type === 'time_in' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(log.scan_type || 'Unknown').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      No logs for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
