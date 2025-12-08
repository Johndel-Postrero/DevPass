import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminSettings from './AdminSettings';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  QrCode, 
  Users, 
  Laptop, 
  Shield, 
  Settings, 
  LogOut, 
  Bell, 
  Moon, 
  Sun,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  User
} from 'lucide-react';
// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
function DeviceDetailsModal({ device, darkMode, onClose, onApprove, onReject }) {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-inherit flex items-center justify-between p-6 border-b" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Device Details</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <h3 className={`font-bold mb-3 ${textPrimary}`}>Student Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={`text-sm ${textSecondary}`}>Name</p>
                <p className={`font-semibold ${textPrimary}`}>{device.studentName}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>Student ID</p>
                <p className={`font-semibold ${textPrimary}`}>{device.studentId}</p>
              </div>
             <div>
                <p className={`text-sm ${textSecondary}`}>Department</p>
                <p className={`font-semibold ${textPrimary}`}>{device.department?.dept_name || device.department}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>Course</p>
                <p className={`font-semibold ${textPrimary}`}>{device.course?.course_name || device.course}</p>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div>
            <h3 className={`font-bold mb-3 ${textPrimary}`}>Device Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Device Type</p>
                <p className={`font-semibold ${textPrimary}`}>{device.type}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Brand</p>
                <p className={`font-semibold ${textPrimary}`}>{device.brand}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Model</p>
                <p className={`font-semibold ${textPrimary}`}>{device.model}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Serial Number</p>
                <p className={`font-semibold ${textPrimary}`}>{device.serialNumber}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Registration Date</p>
                <p className={`font-semibold ${textPrimary}`}>{device.registrationDate}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  device.status === 'pending' 
                    ? darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                    : darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {device.status === 'pending' && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  onReject(device.id);
                  onClose();
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  darkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  onApprove(device.id);
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [devices, setDevices] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    scansToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  // Add this with your other useState declarations
  const [showSettings, setShowSettings] = useState(false);
  // Fetch devices and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const status = activeTab === 'all' ? 'all' : activeTab;
        const [devicesRes, statsRes, scansRes] = await Promise.all([
          api.get(`/devices?status=${status}`),
          api.get('/devices/stats'),
          api.get('/entries?limit=10')
        ]);
        
        setDevices(devicesRes.data);
        setStats({
          ...statsRes.data,
          scansToday: scansRes.data.length
        });
        setRecentScans(scansRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, navigate]);

  // Refresh data after approve/reject
  const refreshData = async () => {
    try {
      const status = activeTab === 'all' ? 'all' : activeTab;
      const [devicesRes, statsRes, scansRes] = await Promise.all([
        api.get(`/devices?status=${status}`),
        api.get('/devices/stats'),
        api.get('/entries?limit=10')
      ]);
      setDevices(devicesRes.data);
      setStats({
        ...statsRes.data,
        scansToday: scansRes.data.length
      });
      setRecentScans(scansRes.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

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

  const inputBg = darkMode
    ? 'bg-white/10 border-white/20'
    : 'bg-white/60 border-white/40';

  const handleApprove = async (deviceId) => {
    try {
      const response = await api.post(`/devices/${deviceId}/approve`);
      if (response.data.message) {
        // Show success message (you can replace with a toast notification)
        console.log('Device approved successfully');
      }
      await refreshData();
    } catch (error) {
      console.error('Error approving device:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve device';
      alert(errorMessage);
    }
  };

  const handleReject = async (deviceId) => {
    try {
      const response = await api.post(`/devices/${deviceId}/reject`);
      if (response.data.message) {
        // Show success message (you can replace with a toast notification)
        console.log('Device rejected successfully');
      }
      await refreshData();
    } catch (error) {
      console.error('Error rejecting device:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject device';
      alert(errorMessage);
    }
  };

  const filteredDevices = devices
    .filter(device => {
      const matchesSearch = 
        device.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      // When showing all devices, prioritize pending devices at the top
      if (activeTab === 'all') {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
      }
      // For other tabs, maintain original order
      return 0;
    });

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
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
                <p className={`text-xs ${textSecondary}`}>Administrator Dashboard</p>
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
              <button 
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <Settings className={`w-5 h-5 ${textSecondary}`} />
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${darkMode ? 'hover:bg-white/10 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>
            Admin Dashboard 
          </h2>
          <p className={`text-sm sm:text-base ${textSecondary}`}>
            Monitor and manage device registrations
          </p>
        </div>

        {/* Stats Cards */}
        {/* Charts Section */}
<div className="mb-6 sm:mb-8">
  <div className="grid gap-3 sm:gap-6 mb-6">
    {/* Bar Chart - Device Status Distribution */}
    <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-1`}>Device Status Overview</h3>
          <p className={`text-xs sm:text-sm ${textSecondary}`}>Current distribution of device registrations</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60'}`}>
          <BarChart3 className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
      </div>
      <div className="h-64 sm:h-72">
        <Bar
          data={{
            labels: ['Pending', 'Active', 'Rejected'],
            datasets: [
              {
                label: 'Devices',
                data: [
                  stats.pending || 0,
                  stats.active || 0,
                  (stats.total || 0) - (stats.pending || 0) - (stats.active || 0)
                ],
                backgroundColor: [
                  darkMode ? 'rgba(34, 211, 238, 0.8)' : 'rgba(34, 211, 238, 0.6)', // Cyan for Pending
                  darkMode ? 'rgba(6, 182, 212, 0.8)' : 'rgba(6, 182, 212, 0.6)',   // Sky Blue for Active
                  darkMode ? 'rgba(2, 132, 199, 0.8)' : 'rgba(2, 132, 199, 0.6)',   // Blue for Rejected
                ],
                borderColor: [
                  darkMode ? 'rgba(34, 211, 238, 1)' : 'rgba(34, 211, 238, 1)',
                  darkMode ? 'rgba(6, 182, 212, 1)' : 'rgba(6, 182, 212, 1)',
                  darkMode ? 'rgba(2, 132, 199, 1)' : 'rgba(2, 132, 199, 1)',
                ],
                borderWidth: 1,
                borderRadius: 8,
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  font: {
                    size: 12
                  },
                  padding: 20
                }
              },
              tooltip: {
                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: darkMode ? '#F3F4F6' : '#111827',
                bodyColor: darkMode ? '#D1D5DB' : '#4B5563',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  font: {
                    size: 11
                  }
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                  font: {
                    size: 11
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>

    {/* Doughnut Chart - Scan Activity */}
    {/* <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-1`}>Scan Activity</h3>
          <p className={`text-xs sm:text-sm ${textSecondary}`}>Today's entry attempts</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60'}`}>
          <Activity className={`w-4 h-4 sm:w-6 sm:h-6 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 h-64 sm:h-72">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-48 w-48 mb-4">
            <Doughnut
              data={{
                labels: ['Success', 'Failed'],
                datasets: [
                  {
                    data: [Math.floor(stats.scansToday * 0.8), Math.floor(stats.scansToday * 0.2)],
                    backgroundColor: [
                      darkMode ? 'rgba(34, 211, 238, 0.8)' : 'rgba(34, 211, 238, 0.6)', // Cyan for Success
                      darkMode ? 'rgba(2, 132, 199, 0.8)' : 'rgba(2, 132, 199, 0.6)',   // Blue for Failed
                    ],
                    borderColor: [
                      darkMode ? 'rgba(34, 211, 238, 1)' : 'rgba(34, 211, 238, 1)',
                      darkMode ? 'rgba(2, 132, 199, 1)' : 'rgba(2, 132, 199, 1)',
                    ],
                    borderWidth: 1,
                    cutout: '70%',
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-2xl sm:text-3xl font-bold ${textPrimary}`}>{stats.scansToday}</span>
              <span className={`text-xs ${textSecondary}`}>Total Scans</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <div>
              <p className={`text-sm font-semibold ${textPrimary}`}>Successful</p>
              <p className={`text-xs ${textSecondary}`}>{Math.floor(stats.scansToday * 0.8)} entries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div>
              <p className={`text-sm font-semibold ${textPrimary}`}>Failed</p>
              <p className={`text-xs ${textSecondary}`}>{Math.floor(stats.scansToday * 0.2)} attempts</p>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Success Rate</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-lg font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>80%</span>
              <TrendingUp className={`w-4 h-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
          </div>
        </div>
      </div>
    </div> */}
  </div>

  {/* Mini Stats Cards Row */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
    <button
      onClick={() => setActiveTab('all')}
      className={`${cardBg} rounded-xl sm:rounded-2xl p-4 transition-all ${hoverCardBg} cursor-pointer text-left group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'}`}>
          <Laptop className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
        <span className={`text-lg font-bold ${textPrimary}`}>{stats.total}</span>
      </div>
      <p className={`text-xs ${textSecondary}`}>Total Devices</p>
      <div className="mt-2 h-1 w-full bg-gray-500/20 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-500" style={{ width: '100%' }}></div>
      </div>
    </button>

    <button
      onClick={() => setActiveTab('pending')}
      className={`${cardBg} rounded-xl sm:rounded-2xl p-4 transition-all ${hoverCardBg} cursor-pointer text-left group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'}`}>
          <Clock className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
        <span className={`text-lg font-bold ${textPrimary}`}>{stats.pending}</span>
      </div>
      <p className={`text-xs ${textSecondary}`}>Pending</p>
      <div className="mt-2 h-1 w-full bg-gray-500/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
          style={{ width: `${stats.total ? ((stats.pending / stats.total) * 100) : 0}%` }}
        ></div>
      </div>
    </button>

    <button
      onClick={() => setActiveTab('active')}
      className={`${cardBg} rounded-xl sm:rounded-2xl p-4 transition-all ${hoverCardBg} cursor-pointer text-left group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'}`}>
          <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
        <span className={`text-lg font-bold ${textPrimary}`}>{stats.active}</span>
      </div>
      <p className={`text-xs ${textSecondary}`}>Active</p>
      <div className="mt-2 h-1 w-full bg-gray-500/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
          style={{ width: `${stats.total ? ((stats.active / stats.total) * 100) : 0}%` }}
        ></div>
      </div>
    </button>

    <button
      onClick={() => setActiveTab('scans')}
      className={`${cardBg} rounded-xl sm:rounded-2xl p-4 transition-all ${hoverCardBg} cursor-pointer text-left group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'}`}>
          <Activity className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
        </div>
        <span className={`text-lg font-bold ${textPrimary}`}>{stats.scansToday}</span>
      </div>
      <p className={`text-xs ${textSecondary}`}>Scans Today</p>
      <div className="mt-2 h-1 w-full bg-gray-500/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500" 
          style={{ width: `${Math.min(stats.scansToday * 5, 100)}%` }}
        ></div>
      </div>
    </button>
  </div>
</div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search by name, ID, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border ${inputBg} ${textPrimary} placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          {/* <button className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/60 hover:bg-white/80 text-gray-900'}`}>
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Filter</span>
          </button> */}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base  transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? ` ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} shadow-lg`
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? `${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} shadow-lg`
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            All Devices ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scans'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            Recent Scans
          </button>
        </div>

        {/* Content */}
        {activeTab === 'scans' ? (
          <div className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 sm:mb-6`}>Recent Scan Activity</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : recentScans.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                <p className={`${textSecondary}`}>No recent scans</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentScans.map((scan) => (
                  <div 
                    key={scan.id} 
                    onClick={() => setSelectedScan(scan)}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all cursor-pointer ${darkMode ? 'hover:bg-white/5' : 'hover:bg-white/60'}`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${scan.status === 'success' ? (darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100') : (darkMode ? 'bg-red-500/20' : 'bg-red-100')} flex-shrink-0`}>
                        {scan.status === 'success' ? (
                          <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        ) : (
                          <XCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-sm sm:text-base ${textPrimary} truncate`}>{scan.studentName}</h4>
                        <p className={`text-xs sm:text-sm ${textSecondary}`}>{scan.gate} • {scan.time}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${textMuted} flex-shrink-0`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className={`${cardBg} rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center`}>
                <AlertCircle className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${textMuted}`} />
                <h3 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-2`}>No devices found</h3>
                <p className={`${textSecondary}`}>Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredDevices.map((device) => (
                <div key={device.id} className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all ${hoverCardBg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                        <Laptop className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-base sm:text-lg font-bold ${textPrimary} truncate`}>
                            {device.brand} {device.model}
                          </h3>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            device.status === 'pending'
                              ? darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                              : darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </span>
                        </div>
                        <p className={`text-xs sm:text-sm ${textSecondary} mb-2`}>
                          {device.studentName} • {device.studentId}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                          <span className={`${textMuted}`}>{device.department?.dept_name || device.department}</span>
                          <span className={`${textMuted}`}>•</span>
                          <span className={`${textMuted}`}>{device.course?.course_name || device.course}</span>
                          <span className={`${textMuted}`}>•</span>
                          <span className={`${textMuted}`}>Registered: {device.registrationDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedDevice(device)}
                        className={`p-2 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {device.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReject(device.id)}
                            className={`p-2 rounded-lg font-semibold transition-all ${
                              darkMode 
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                                : 'bg-red-100 hover:bg-red-200 text-red-700'
                            }`}
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleApprove(device.id)}
                            className={`p-2 rounded-lg font-semibold transition-all ${
                              darkMode 
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400' 
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                            }`}
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          darkMode={darkMode}
          onClose={() => setSelectedDevice(null)}
          onApprove={handleApprove}
          onReject={handleReject}
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
                  <X className={`w-5 h-5 ${textSecondary}`} />
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
                    {selectedScan.studentDepartment && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Department:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.studentDepartment}</span>
                      </div>
                    )}
                    {selectedScan.studentCourse && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Course:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.studentCourse}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gate Information */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <MapPin className="w-5 h-5" />
                    Gate Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${textSecondary}`}>Gate Name:</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.gate}</span>
                    </div>
                    {selectedScan.gateLocation && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Location:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.gateLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Information */}
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
                    {selectedScan.deviceType && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Type:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.deviceType}</span>
                      </div>
                    )}
                    {selectedScan.deviceSerial && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Serial Number:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.deviceSerial}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Information */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Clock className="w-5 h-5" />
                    Scan Time
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${textSecondary}`}>Date & Time:</span>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.fullTimestamp || selectedScan.time}</span>
                    </div>
                  </div>
                </div>

                {/* Security Guard */}
                {selectedScan.securityGuard && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <Shield className="w-5 h-5" />
                      Security Personnel
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${textSecondary}`}>Guard Name:</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.securityGuard}</span>
                      </div>
                      {selectedScan.securityGuardId && (
                        <div className="flex justify-between">
                          <span className={`text-sm ${textSecondary}`}>Guard ID:</span>
                          <span className={`text-sm font-semibold ${textPrimary}`}>{selectedScan.securityGuardId}</span>
                        </div>
                      )}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <LogOut className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>Confirm Logout</h2>
                  <p className={`text-sm ${textSecondary}`}>Are you sure you want to log out?</p>
                </div>
              </div>
              
              <p className={`text-sm mb-6 ${textSecondary}`}>
                You will need to log in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Clear storage synchronously first (before closing modal)
                    localStorage.removeItem('token');
                    localStorage.removeItem('student');
                    localStorage.removeItem('rememberMe');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('student');
                    // Close modal
                    setShowLogoutConfirm(false);
                    // Navigate to landing page immediately - this will cause full page reload
                    window.location.replace('/');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <AdminSettings
          darkMode={darkMode}
          onClose={() => setShowSettings(false)}
          adminData={{
            name: "Admin User", // You can pass actual admin data here
            email: "admin@devpass.edu",
            phone: "+63 912 345 6789",
            role: "System Administrator",
            joinDate: "January 15, 2024",
            lastLogin: new Date().toLocaleString()
          }}
        />
      )}
    </div>
  );
}