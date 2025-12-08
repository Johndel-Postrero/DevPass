import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import SecuritySettingsModal from './SecuritySettingsModal';
import { 
  QrCode, 
  Shield, 
  Scan,
  Settings, 
  LogOut, 
  Bell, 
  Moon, 
  Sun,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  User,
  Laptop,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  CameraOff,
  Loader2
} from 'lucide-react';
import { securityService } from '../../services/securityService';
import { authService } from '../../services/authService';

function ScanResultModal({ result, darkMode, onClose, onAccept, onDeny, gate, processing = false }) {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const isValidQR = result.valid === true;
  const studentData = result.student_data || result.student || {};
  const deviceData = result.device || {};
  const showDecision = result.showDecision === true;
  const decision = result.decision;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {isValidQR ? (
            <>
              {/* Valid QR Code - Show Student Info */}
              <div className="text-center mb-6">
                {showDecision ? (
                  <>
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${decision === 'accepted' ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200') : (darkMode ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-200')} border-2`}>
                      {decision === 'accepted' ? (
              <CheckCircle className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            ) : (
              <XCircle className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                      {decision === 'accepted' ? 'Access Granted' : 'Access Denied'}
          </h2>
                    <p className={`text-sm ${textSecondary}`}>
                      {decision === 'accepted' ? 'Student access has been approved' : 'Student access has been denied'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-50 border-blue-200'} border-2`}>
                      <QrCode className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
          <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                      QR Code Scanned
          </h2>
                    <p className={`text-sm ${textSecondary}`}>
                      Review student information and decide access
          </p>
                  </>
                )}
              </div>

              {/* Student Information */}
              {studentData && (
            <div className={`p-4 rounded-xl mb-6 text-left ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Student Information</h3>
              <div className="space-y-3">
                    {studentData.student_name && (
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${textSecondary}`} />
                  <div className="flex-1">
                          <p className={`text-xs ${textSecondary}`}>Name</p>
                          <p className={`font-semibold ${textPrimary}`}>{studentData.student_name}</p>
                  </div>
                </div>
                    )}
                    {studentData.student_id && (
                      <div className="flex items-center gap-3">
                        <User className={`w-5 h-5 ${textSecondary}`} />
                        <div className="flex-1">
                          <p className={`text-xs ${textSecondary}`}>Student ID</p>
                          <p className={`font-semibold ${textPrimary}`}>{studentData.student_id}</p>
                        </div>
                      </div>
                    )}
                   {studentData.student_department && (
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${textSecondary}`} />
                      <div className="flex-1">
                        <p className={`text-xs ${textSecondary}`}>Department</p>
                        <p className={`font-semibold ${textPrimary}`}>
                          {studentData.student_department?.dept_name || studentData.student_department}
                        </p>
                      </div>
                    </div>
                  )}
                  {studentData.student_course && (
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${textSecondary}`} />
                      <div className="flex-1">
                        <p className={`text-xs ${textSecondary}`}>Course</p>
                        <p className={`font-semibold ${textPrimary}`}>
                          {studentData.student_course?.course_name || studentData.student_course}
                        </p>
                      </div>
                    </div>
                  )}
                    {deviceData.brand && deviceData.model && (
                <div className="flex items-center gap-3">
                  <Laptop className={`w-5 h-5 ${textSecondary}`} />
                  <div className="flex-1">
                    <p className={`text-xs ${textSecondary}`}>Device</p>
                          <p className={`font-semibold ${textPrimary}`}>{deviceData.brand} {deviceData.model}</p>
                  </div>
                </div>
                    )}
                    {deviceData.device_type && (
                <div className="flex items-center gap-3">
                        <Laptop className={`w-5 h-5 ${textSecondary}`} />
                  <div className="flex-1">
                          <p className={`text-xs ${textSecondary}`}>Device Type</p>
                          <p className={`font-semibold ${textPrimary}`}>{deviceData.device_type}</p>
                  </div>
                </div>
                    )}
              </div>
            </div>
          )}

              {/* Accept/Deny Buttons - Only show if decision not made yet */}
              {!showDecision && (
                <div className="flex gap-3">
                  <button
                    onClick={onDeny}
                    disabled={processing}
                    className="flex-1 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Denied'}
                  </button>
                  <button
                    onClick={onAccept}
                    disabled={processing}
                    className="flex-1 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Invalid QR Code - Show Error */}
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-500/20 border-red-500/40' : 'bg-red-50 border-red-200'} border-2`}>
                  <XCircle className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                  Invalid QR Code
                </h2>
                <p className={`text-base mb-6 ${textSecondary}`}>
                  {result.message || 'QR code is not from the DevPass system. Please ensure you are scanning a valid student device QR code.'}
                </p>
          <button
            onClick={onClose}
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
          >
            Close
          </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SecurityPersonnel() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [gate, setGate] = useState('Gate 1');
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingDecision, setProcessingDecision] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [stats, setStats] = useState({
    scansToday: 0,
    successRate: 0,
    lastHour: 0
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const isScanningRef = useRef(false);

  const bgClass = darkMode 
    ? 'bg-black text-white' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900';

  const cardBg = darkMode
    ? 'bg-white/5 border border-white/10 backdrop-blur-xl'
    : 'bg-white/80 border border-white/60 backdrop-blur-xl';

  const hoverCardBg = darkMode
    ? 'hover:bg-white/10'
    : 'hover:bg-white/90';

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-500' : 'text-gray-500';

  // Check authentication and load data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication
        if (!authService.isAuthenticated()) {
          setError('Not authenticated. Redirecting...');
          setTimeout(() => navigate('/'), 1000);
          setLoading(false);
          return;
        }
        
        // Check if user is security
        if (!authService.isSecurity()) {
          setError('Access denied. Redirecting...');
          setTimeout(() => navigate('/'), 1000);
          setLoading(false);
          return;
        }
        
        // Load data for current gate
        await loadData();
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication error. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
        setLoading(false);
      }
    };
    
    // Run check after a small delay to ensure component renders first
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Load data when gate changes
  useEffect(() => {
    if (authService.isAuthenticated() && authService.isSecurity()) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate]);

  // Load statistics and recent scans for current gate only
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, activitiesData] = await Promise.all([
        securityService.getStatistics(gate),
        securityService.getRecentScans(50, gate)
      ]);
      
      setStats(statsData || { scansToday: 0, successRate: 0, lastHour: 0 });
      
      // Format activities for display - filter by current gate
      const formattedActivities = (activitiesData || [])
        .filter(activity => activity.gate === gate) // Ensure only current gate's scans
        .map(activity => ({
          id: activity.id || Math.random(),
          studentName: activity.studentName || 'Unknown',
          studentId: activity.studentId || 'N/A',
          device: activity.device || 'N/A',
          time: activity.time || 'N/A',
          gate: activity.gate || gate,
          status: activity.status === 'success' ? 'success' : 'failed',
          fullTimestamp: activity.fullTimestamp || activity.time,
          deviceType: activity.deviceType,
          deviceSerial: activity.deviceSerial,
          studentDepartment: activity.studentDepartment,
          studentCourse: activity.studentCourse,
          gateLocation: activity.gateLocation,
          securityGuard: activity.securityGuard,
          securityGuardId: activity.securityGuardId
        }));
      
      setScanHistory(formattedActivities);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      // Set default values on error
      setStats({ scansToday: 0, successRate: 0, lastHour: 0 });
      setScanHistory([]);
      
      // Only redirect if it's a real authentication error (401) and no token exists
      if (err.response?.status === 401) {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          // No token means we're already logged out
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup camera stream on unmount or when scanning stops
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        if (typeof scanIntervalRef.current === 'number') {
          cancelAnimationFrame(scanIntervalRef.current);
        } else {
          clearInterval(scanIntervalRef.current);
        }
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);
      isScanningRef.current = true;

      // Request camera access with lower resolution for faster processing
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 }, // Lower resolution for faster processing
          height: { ideal: 480 }
        }
      });

      setStream(mediaStream);

      // Set video stream
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        
        // Wait for video to be ready before starting scan
        const onVideoReady = () => {
          video.play().then(() => {
            console.log('Video playing, starting scan...');
            // Wait a bit for video to stabilize, then start scanning
      setTimeout(() => {
              if (isScanningRef.current && videoRef.current) {
                startQRScanning();
              }
            }, 200);
          }).catch(err => {
            console.error('Video play error:', err);
            setCameraError('Failed to start video feed');
            setIsScanning(false);
            isScanningRef.current = false;
          });
        };

        // Try multiple ways to detect when video is ready
        if (video.readyState >= 2) {
          onVideoReady();
        } else {
          video.onloadedmetadata = onVideoReady;
          video.oncanplay = () => {
            if (isScanningRef.current && !scanIntervalRef.current) {
              onVideoReady();
            }
          };
        }

        // Handle video errors
        video.onerror = (err) => {
          console.error('Video error:', err);
          setCameraError('Failed to load video feed');
          setIsScanning(false);
          isScanningRef.current = false;
        };
      }

    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const startQRScanning = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure canvas is initialized
    if (!canvas.getContext) {
      console.error('Canvas context not available');
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });

    // Use requestAnimationFrame for smoother, faster scanning
    const scan = () => {
      // Check if scanning was stopped
      if (!isScanningRef.current || !video) {
        return;
      }

      // Wait for video to have data
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        scanIntervalRef.current = requestAnimationFrame(scan);
        return;
      }

      try {
        // Get video dimensions
        const videoWidth = video.videoWidth || video.clientWidth || 640;
        const videoHeight = video.videoHeight || video.clientHeight || 480;
        
        if (!videoWidth || !videoHeight || videoWidth === 0 || videoHeight === 0) {
          scanIntervalRef.current = requestAnimationFrame(scan);
          return;
        }

        // Set canvas size to match video or reasonable size (max 400px for speed)
        const maxSize = 400;
        let canvasWidth, canvasHeight;
        
        if (videoWidth <= maxSize && videoHeight <= maxSize) {
          // Use actual video size if it's small enough
          canvasWidth = videoWidth;
          canvasHeight = videoHeight;
        } else {
          // Scale down proportionally
          const scale = Math.min(maxSize / videoWidth, maxSize / videoHeight);
          canvasWidth = Math.floor(videoWidth * scale);
          canvasHeight = Math.floor(videoHeight * scale);
        }

        // Update canvas dimensions if needed
        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
        }

        // Draw full video frame to canvas
        context.imageSmoothingEnabled = false; // Faster processing
        context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        
        // Get image data
        const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        
        if (!imageData || !imageData.data || imageData.data.length === 0) {
          scanIntervalRef.current = requestAnimationFrame(scan);
          return;
        }

        // Use jsQR to detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data) {
          console.log('QR code detected:', code.data.substring(0, 50));
          // QR code detected - stop scanning immediately
          if (scanIntervalRef.current) {
            cancelAnimationFrame(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          isScanningRef.current = false;
          stopCamera();
          handleQRScanned(code.data);
          return;
        }
      } catch (error) {
        console.error('Scan error:', error);
        // Continue scanning even on error
      }

      // Continue scanning
      scanIntervalRef.current = requestAnimationFrame(scan);
    };

    // Start scanning loop immediately
    console.log('Starting QR scan loop...');
    scanIntervalRef.current = requestAnimationFrame(scan);
  };

  const handleQRScanned = async (qrData) => {
    // Stop scanning
    stopCamera();
    
    try {
      // Clean the QR data (remove whitespace)
      let hash = qrData.trim();
      
      // Try to decode URL encoding if present
      try {
        hash = decodeURIComponent(hash);
      } catch (e) {
        // Not URL encoded, continue with original hash
      }
      
      // Try to parse as JSON first (for backward compatibility)
      try {
        const jsonData = JSON.parse(hash);
        // If it's JSON, extract the hash
        if (jsonData.hash) {
          hash = jsonData.hash;
          console.log('Extracted hash from JSON:', hash.substring(0, 20) + '...');
        } else if (jsonData.deviceId) {
          // Old format - try to use deviceId to get hash (not ideal, but handle it)
          setScanResult({
            valid: false,
            message: 'QR code format outdated. Please regenerate QR code.',
            student_data: null
          });
          return;
        }
      } catch (e) {
        // Not JSON, continue with hash extraction
      }
      
      // Handle URLs - extract hash from URL if it's a URL
      if (hash.startsWith('http://') || hash.startsWith('https://')) {
        // Try to extract hash from URL path
        const urlMatch = hash.match(/\/devices\/(\d+)\/scan/);
        if (urlMatch) {
          setScanResult({
            valid: false,
            message: 'Invalid QR code format. QR code should contain the device hash, not a URL. Please regenerate the QR code.',
            student_data: null
          });
          return;
        }
        // If it's a different URL format, try to extract hash from query params or path
        const hashMatch = hash.match(/[a-fA-F0-9]{64}/); // SHA256 hash is 64 hex characters
        if (hashMatch) {
          hash = hashMatch[0];
        } else {
          setScanResult({
            valid: false,
            message: 'Invalid QR code format. QR code should contain the device hash, not a URL.',
            student_data: null
          });
          return;
        }
      }
      
      // Validate hash format (SHA256 hash should be 64 hex characters)
      if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
        setScanResult({
          valid: false,
          message: 'Invalid QR code format. QR code hash is not in the correct format.',
          student_data: null
        });
        return;
      }
      
      console.log('Final QR hash:', hash.substring(0, 20) + '...');
      
      // First, try to read QR code to get student info (doesn't log activity)
      const readResult = await securityService.readQR(hash);
      
      // Store the hash in the result for accept/deny actions
      if (readResult.valid) {
        setScanResult({
          ...readResult,
          qr_hash: hash // Store hash for accept/deny actions
        });
      } else {
        // QR not found in system - show error
        setScanResult({
          valid: false,
          message: readResult.message || 'QR code is not from the DevPass system. This QR code is not registered in our database.',
          student_data: null
        });
      }
      
    } catch (error) {
      console.error('QR read error:', error);
      setScanResult({
        valid: false,
        message: error.response?.data?.message || 'QR code is not from the DevPass system. This QR code is not registered in our database.',
        student_data: null
      });
    }
  };

  const handleAccept = async () => {
    if (!scanResult || !scanResult.valid || processingDecision) return;
    
    setProcessingDecision(true);
    try {
      // Get the hash from stored result - check multiple possible locations
      const qrHash = scanResult.qr_hash || scanResult.device?.qr_hash;
      
      console.log('Accept - scanResult:', scanResult);
      console.log('Accept - qrHash:', qrHash);
    
    if (!qrHash) {
        console.error('No QR hash found in result:', scanResult);
        alert('Unable to find QR code hash. Please scan again.');
        setScanResult(null);
        setProcessingDecision(false);
      return;
    }

      // Validate and log as accepted
      const result = await securityService.validateQR(qrHash.trim(), gate);
      
      console.log('Accept result:', result);
      
      // Show success message
      setScanResult({
        ...result,
        decision: 'accepted',
        showDecision: true,
        qr_hash: qrHash // Preserve hash
      });
      
      // Reload data to update statistics and history
      await loadData();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setScanResult(null);
        setProcessingDecision(false);
      }, 2000);
      
    } catch (error) {
      console.error('Accept error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process acceptance. Please try again.';
      alert(errorMessage);
      setProcessingDecision(false);
    }
  };

  const handleDeny = async () => {
    if (!scanResult || !scanResult.valid || processingDecision) return;
    
    setProcessingDecision(true);
    try {
      // Get the hash from stored result - check multiple possible locations
      const qrHash = scanResult.qr_hash || scanResult.device?.qr_hash;
      
      console.log('Deny - scanResult:', scanResult);
      console.log('Deny - qrHash:', qrHash);
      
      if (!qrHash) {
        console.error('No QR hash found in result:', scanResult);
        alert('Unable to find QR code hash. Please scan again.');
        setScanResult(null);
        setProcessingDecision(false);
        return;
      }
      
      // Log as denied
      const result = await securityService.denyAccess(qrHash.trim(), gate);
      
      console.log('Deny result:', result);
      
      // Check if the deny was successful
      if (result.success === false) {
        throw new Error(result.message || 'Failed to process denial');
      }
      
      // Show denied message but keep student info visible
      setScanResult({
        ...scanResult,
        decision: 'denied',
        showDecision: true
      });
      
      // Reload data to update statistics and history
      await loadData();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setScanResult(null);
        setProcessingDecision(false);
      }, 2000);
      
    } catch (error) {
      console.error('Deny error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process denial. Please try again.';
      alert(errorMessage);
      setProcessingDecision(false);
    }
  };

  const stopCamera = () => {
    // Cancel animation frame if using requestAnimationFrame
    if (scanIntervalRef.current) {
      if (typeof scanIntervalRef.current === 'number') {
        cancelAnimationFrame(scanIntervalRef.current);
      } else {
        clearInterval(scanIntervalRef.current);
      }
      scanIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    setIsScanning(false);
    isScanningRef.current = false;
  };

  const handleScan = () => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Always render - show loading state if needed
  return (
    <div className={`min-h-screen ${bgClass || 'bg-black text-white'} transition-colors duration-500`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-10 w-80 h-80 ${darkMode ? 'bg-blue-600/20' : 'bg-blue-200/30'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-20 w-96 h-96 ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-200/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      {/* Top Navigation */}
      <nav className={`sticky top-0 z-40 ${cardBg} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                  DevPass 
                </h1>
                <p className={`text-xs ${textSecondary}`}>Gate Scanner</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* <button className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
              </button> */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                )}
              </button>
              <button className={`hidden sm:block p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                onClick={() => setShowSettings(true)}

>
                <Settings className={`w-5 h-5 ${textSecondary}`} />
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('student');
                  localStorage.removeItem('rememberMe');
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('student');
                  window.location.replace('/');
                }}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Loading State - Show only if truly loading and no data */}
        {loading && scanHistory.length === 0 && stats.scansToday === 0 && stats.successRate === 0 && !error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className={`text-lg ${textSecondary}`}>Loading security dashboard...</p>
            </div>
          </div>
        ) : (
          <div>
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>
            Security Scanner 
          </h2>
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${textSecondary}`} />
            <select
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className={`text-sm sm:text-base ${textSecondary} bg-transparent border-none focus:outline-none cursor-pointer`}
            >
                  <option value="Gate 1">Gate 1</option>
                  <option value="Gate 2">Gate 2</option>
                  <option value="Gate 3">Gate 3</option>
                  <option value="Gate 4">Gate 4</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Scan className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>{stats.scansToday}</h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Scans Today</p>
          </div>

          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <TrendingUp className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>{stats.successRate}%</h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Success Rate</p>
          </div>

          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                <Activity className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>{stats.lastHour}</h3>
            <p className={`text-xs sm:text-sm ${textSecondary}`}>Last Hour</p>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8`}>
          <h3 className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-6 text-center`}>
            Scan QR Code
          </h3>

          <div className="max-w-md mx-auto">
            {/* Scanner Visual */}
            <div className={`relative aspect-square rounded-2xl overflow-hidden mb-6 ${
              isScanning 
                ? 'bg-black border-2 border-blue-500' 
                : darkMode 
                ? 'bg-white/5 border-2 border-white/20' 
                : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              {isScanning ? (
                <>
                  {/* Video Feed */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  {/* Canvas for QR detection (hidden but properly sized) */}
                  <canvas 
                    ref={canvasRef} 
                    style={{ display: 'none' }}
                    width="400"
                    height="400"
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-4 border-blue-500 rounded-2xl relative">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                      
                      {/* Scanning line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-scan shadow-lg shadow-blue-500/50"></div>
                    </div>
                  </div>

                  {/* Scanning Text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white font-semibold text-sm bg-black/60 px-4 py-2 rounded-full inline-block">
                      Scanning for QR Code...
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  {cameraError ? (
                    <>
                      <CameraOff className={`w-20 h-20 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <p className={`text-sm text-center px-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {cameraError}
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera className={`w-20 h-20 ${textMuted}`} />
                      <p className={`text-sm ${textSecondary}`}>Camera Ready</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isScanning
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {isScanning ? (
                <span className="flex items-center justify-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Stop Scanning
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <QrCode className="w-6 h-6" />
                  Start Camera
                </span>
              )}
            </button>

            <p className={`text-center text-sm mt-4 ${textSecondary}`}>
              {isScanning ? 'Position the QR code within the frame' : 'Click to activate camera and scan QR codes'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6`}>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                {error}. Please refresh the page or try again.
              </p>
            </div>
          </div>
        )}

        {/* Recent Scans - Current Gate */}
        <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
          <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 sm:mb-6`}>Recent Scans - {gate}</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : scanHistory.length === 0 ? (
            <div className="text-center py-12">
              <Activity className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
              <p className={`text-sm sm:text-base ${textSecondary}`}>No scans yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {scanHistory.map((scan) => (
              <div 
                key={scan.id} 
                onClick={() => setSelectedScan(scan)}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all cursor-pointer ${darkMode ? 'hover:bg-white/5' : 'hover:bg-white/60'}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
                    scan.status === 'success'
                      ? darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : darkMode ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    {scan.status === 'success' ? (
                      <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <XCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm sm:text-base ${textPrimary} truncate`}>
                      {scan.studentName}
                    </h4>
                    <p className={`text-xs sm:text-sm ${textSecondary}`}>
                      {scan.device} • {scan.time}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${
                  scan.status === 'success'
                    ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    : darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  {scan.status === 'success' ? 'Granted' : 'Denied'}
                </span>
              </div>
              ))}
            </div>
          )}
        </div>
          </div>
        )}
      </div>

      {/* Scan Result Modal */}
      {scanResult && (
        <ScanResultModal
          result={scanResult}
          darkMode={darkMode}
          gate={gate}
          processing={processingDecision}
          onClose={() => setScanResult(null)}
          onAccept={handleAccept}
          onDeny={handleDeny}
        />
      )}

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedScan(null)}>
          <div 
            className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-md shadow-2xl border max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Scan Details</h2>
                <button
                  onClick={() => setSelectedScan(null)}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <XCircle className={`w-5 h-5 ${textSecondary}`} />
                </button>
                </div>

              <div className="space-y-4">
                {/* Status */}
                <div className={`p-4 rounded-xl ${selectedScan.status === 'success' 
                  ? (darkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                  : (darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200')
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedScan.status === 'success' ? (
                      <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    )}
                <div>
                      <p className={`text-sm font-semibold ${selectedScan.status === 'success' 
                        ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                        : (darkMode ? 'text-red-400' : 'text-red-700')
                      }`}>
                        {selectedScan.status === 'success' ? 'Access Granted' : 'Access Denied'}
                      </p>
                      <p className={`text-xs ${textSecondary}`}>
                        {selectedScan.status === 'success' ? 'Successfully scanned at gate' : 'Access was denied'}
                      </p>
                    </div>
                </div>
              </div>
              
                {/* Student Information */}
                {selectedScan.studentName && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <User className="w-5 h-5" />
                      Student Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Name:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.studentName}</span>
                      </div>
                      {selectedScan.studentId && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Student ID:</span>
                          <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.studentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Device Information */}
                {selectedScan.device && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <Laptop className="w-5 h-5" />
                      Device Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Device:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.device}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Information */}
                {selectedScan.time && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <Clock className="w-5 h-5" />
                      Scan Time
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Time:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.time}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                <button
                onClick={() => setSelectedScan(null)}
                className="w-full mt-6 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Close
                </button>
            </div>
          </div>
        </div>
        
      )}
      {/* Add this with your other modals */}
      {showSettings && (
        <SecuritySettingsModal 
          darkMode={darkMode} 
          onClose={() => setShowSettings(false)}
          securityData={{
            name: "John Security", // Replace with actual data from your auth service
            email: "john.security@university.edu",
            phone: "+63 912 345 6789",
            employeeId: "SEC001",
            assignedGate: gate, // Current gate from state
            role: "Security Personnel",
            joinDate: "January 15, 2024"
          }}
        />
      )}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
