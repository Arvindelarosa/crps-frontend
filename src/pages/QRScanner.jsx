import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode, UserCheck, ShieldAlert, List, RotateCcw,
  Users, Briefcase, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { qrAPI, attendanceAPI } from '../api';
import { useAuthStore } from '../store';

const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

// ─── Reusable Scanner Box ────────────────────────────────────────────────────
const ScannerBox = ({ onScanResult }) => {
  const scannerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [autoResetSeconds, setAutoResetSeconds] = useState(0);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 240, height: 240 },
      fps: 10,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0],
    }, false);

    scannerRef.current = scanner;
    scanner.render(onSuccess, () => {});

    async function onSuccess(decoded) {
      if (loading) return;
      scanner.clear();
      setLoading(true);
      setScanError('');
      try {
        const result = await onScanResult(decoded);
        setScanResult(result);
      } catch (err) {
        setScanError(err.response?.data?.message || 'Invalid QR Code or Scan Error');
      } finally {
        setLoading(false);
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []); // <-- Empty dependency array ensures this runs once on mount

  // Auto-reset effect
  useEffect(() => {
    if (scanResult || scanError) {
      setAutoResetSeconds(3); // Wait 3 seconds before auto-resetting
      const interval = setInterval(() => {
        setAutoResetSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            reset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [scanResult, scanError]);

  const reset = () => {
    setScanResult(null);
    setScanError('');
    setAutoResetSeconds(0);
    // Give DOM a tick to clear the success message before remounting scanner
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 240, height: 240 },
        fps: 10,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0],
      }, false);
  
      scannerRef.current = scanner;
      scanner.render(async (decoded) => {
         if (loading) return;
         scanner.clear();
         setLoading(true);
         setScanError('');
         try {
           const result = await onScanResult(decoded);
           setScanResult(result);
         } catch (err) {
           setScanError(err.response?.data?.message || 'Invalid QR Code or Scan Error');
         } finally {
           setLoading(false);
         }
      }, () => {});
    }, 100);
  };

  if (scanResult) {
    const isWorker = !!scanResult.worker;
    return (
      <div className="animate-fade-in text-center p-6 bg-green-50 rounded-xl border border-green-200">
        <div className={`w-16 h-16 ${isWorker ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {isWorker ? <Briefcase size={32} /> : <UserCheck size={32} />}
        </div>
        <h4 className={`text-xl font-bold mb-1 ${isWorker ? 'text-blue-800' : 'text-green-800'}`}>
          {isWorker ? (scanResult.scan_type === 'time_in' ? '✅ Time In Recorded!' : '🏁 Time Out Recorded!') : 'Access Logged!'}
        </h4>
        <p className={`text-sm font-medium mb-4 ${isWorker ? 'text-blue-600' : 'text-green-600'}`}>
          {isWorker ? `Barangay Worker — ${scanResult.scan_type.replace('_', ' ').toUpperCase()}` : 'Resident verified successfully.'}
        </p>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-left mb-6 space-y-2">
          <div>
            <span className="text-gray-400 text-xs block">Full Name</span>
            <span className="font-bold text-gray-800">
              {isWorker ? scanResult.worker.full_name : `${scanResult.resident?.first_name} ${scanResult.resident?.last_name}`}
            </span>
          </div>
          {isWorker && scanResult.worker.position && (
            <div>
              <span className="text-gray-400 text-xs block">Position</span>
              <span className="font-semibold text-gray-700">{scanResult.worker.position}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400 text-xs block">Action</span>
            <span className={`font-bold uppercase tracking-wide ${isWorker ? 'text-blue-600' : 'text-green-600'}`}>
              {(scanResult.scan_type || 'Unknown').replace('_', ' ')}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 animate-pulse mb-3">
           Ready for next scan in {autoResetSeconds}...
        </p>
        <button onClick={reset} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 w-full justify-center flex items-center gap-2">
          <RotateCcw size={16} /> Scan Now Automatically
        </button>
      </div>
    );
  }

  if (scanError) {
    return (
      <div className="animate-fade-in text-center p-6 bg-red-50 rounded-xl border border-red-200">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h4 className="text-xl font-bold text-red-800 mb-2">Scan Failed</h4>
        <p className="text-red-600 mb-6">{scanError}</p>
        <p className="text-sm text-gray-400 animate-pulse mb-3">
           Retrying in {autoResetSeconds}...
        </p>
        <button onClick={reset} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-8 w-full justify-center flex items-center gap-2">
          <RotateCcw size={16} /> Scan Again Now
        </button>
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Processing scan...</p>
        </div>
      )}
      <div style={{ display: loading ? 'none' : 'block' }}>
        <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-dashed border-[#2E86C1]/50 bg-gray-50" />
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    present:    { label: 'Present', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={11} /> },
    timed_out:  { label: 'Timed Out', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock size={11} /> },
    absent:     { label: 'Absent', color: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={11} /> },
  };
  const s = map[status] || map.absent;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ─── Main QRScanner Page ──────────────────────────────────────────────────────
const QRScanner = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('attendance'); // 'attendance' | 'visitors'
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanKey, setScanKey] = useState(0); // force re-mount scanner on tab switch

  const fetchVisitorLogs = async () => {
    try {
      const res = await qrAPI.getVisitorLog();
      if (res.data.success) setVisitorLogs(res.data.data);
    } catch {}
  };

  const fetchAttendance = async () => {
    try {
      const [summaryRes, logsRes] = await Promise.all([
        attendanceAPI.getSummary({ date: selectedDate }),
        attendanceAPI.getLogs({ date: selectedDate }),
      ]);
      if (summaryRes.data.success) setAttendanceSummary(summaryRes.data.data);
      if (logsRes.data.success) setAttendanceLogs(logsRes.data.data);
    } catch {}
  };

  useEffect(() => { fetchVisitorLogs(); }, []);
  useEffect(() => { fetchAttendance(); }, [selectedDate]);

  // Scanner callbacks per tab
  const handleResidentScan = async (decoded) => {
    const res = await qrAPI.scan({ qr_content: decoded });
    fetchVisitorLogs();
    return res.data.data;
  };

  const handleWorkerScan = async (decoded) => {
    const res = await attendanceAPI.scanWorker({ qr_content: decoded });
    fetchAttendance();
    return res.data.data;
  };

  const presentCount = attendanceSummary.filter(s => s.status !== 'absent').length;
  const absentCount = attendanceSummary.filter(s => s.status === 'absent').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#1B2631] to-[#1a3a5c] p-6 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <QrCode size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
            <p className="text-sm text-blue-200/70">Visitor Log & Employee Attendance System</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 bg-white/10 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setTab('attendance'); setScanKey(k => k + 1); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'attendance' ? 'bg-white text-[#1B2631] shadow' : 'text-white/70 hover:text-white'}`}
          >
            <Briefcase size={15} /> Employee Attendance
          </button>
          <button
            onClick={() => { setTab('visitors'); setScanKey(k => k + 1); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'visitors' ? 'bg-white text-[#1B2631] shadow' : 'text-white/70 hover:text-white'}`}
          >
            <Users size={15} /> Resident Visitor Log
          </button>
        </div>
      </div>

      {/* ── ATTENDANCE TAB ── */}
      {tab === 'attendance' && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 border border-emerald-100 bg-emerald-50 flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Present</p>
                <p className="text-3xl font-black text-emerald-700">{presentCount}</p>
              </div>
            </div>
            <div className="card p-5 border border-red-100 bg-red-50 flex items-center gap-4">
              <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                <XCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">Absent</p>
                <p className="text-3xl font-black text-red-600">{absentCount}</p>
              </div>
            </div>
            <div className="card p-5 border border-blue-100 bg-blue-50 flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Briefcase size={22} />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Workers</p>
                <p className="text-3xl font-black text-blue-700">{attendanceSummary.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Scanner */}
            <div className="card p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <QrCode size={18} className="text-blue-600" /> Scan Worker Badge
              </h3>
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 font-medium">
                📋 Scan the QR code from a barangay worker's badge/profile to record attendance.
              </div>
              <ScannerBox key={`worker-${scanKey}`} onScanResult={handleWorkerScan} />
            </div>

            {/* Attendance Table */}
            <div className="card shadow-sm border border-gray-100 flex flex-col" style={{ maxHeight: 520 }}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <List size={18} className="text-blue-600" /> Daily Attendance
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Worker</th>
                      <th className="px-4 py-3">Time In</th>
                      <th className="px-4 py-3">Time Out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendanceSummary.map((s) => (
                      <tr key={s.worker.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{s.worker.full_name}</div>
                          <div className="text-[11px] text-gray-400 capitalize">{s.worker.position || s.worker.role}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-emerald-700">{fmt(s.time_in)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{fmt(s.time_out)}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                    {attendanceSummary.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-12 text-gray-400 text-sm">No workers found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Scan History */}
          {attendanceLogs.length > 0 && (
            <div className="card p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-slate-500" /> Scan History for {fmtDate(selectedDate)}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Worker</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendanceLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">{fmt(l.scan_timestamp)}</td>
                        <td className="px-4 py-2 font-semibold text-gray-800">{l.worker?.full_name}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${l.scan_type === 'time_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {l.scan_type === 'time_in' ? '→ Time In' : '← Time Out'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VISITOR LOG TAB ── */}
      {tab === 'visitors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Scanner */}
          <div className="card p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <QrCode size={18} className="text-[#1B4F72]" /> Scan Resident ID Card
            </h3>
            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700 font-medium">
              👥 Scan the QR from a resident's Barangay ID card to log their visit.
            </div>
            <ScannerBox key={`resident-${scanKey}`} onScanResult={handleResidentScan} />
          </div>

          {/* Visitor Logs */}
          <div className="card shadow-sm border border-gray-100 flex flex-col" style={{ maxHeight: 520 }}>
            <h3 className="font-bold text-gray-800 p-5 pb-4 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <List size={18} className="text-[#1B4F72]" /> Recent Visitor Activity
            </h3>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white border-b border-gray-100 text-xs text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Resident</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-amber-50/30">
                      <td className="px-5 py-3 text-xs text-gray-500 font-mono">
                        {fmt(log.scan_timestamp)}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {log.Resident?.first_name} {log.Resident?.last_name}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.scan_type === 'time_in' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                          {(log.scan_type || 'Unknown').replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {visitorLogs.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-12 text-gray-400">No visitor logs for today.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
