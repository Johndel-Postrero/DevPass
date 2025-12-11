import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Users, 
  UserPlus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Camera,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Building,
  Lock,
  PlusCircle,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Filter,
  Key,
  Bell,
  Moon,
  Sun,
  LogOut,
  XCircle
} from 'lucide-react';
import api from '../../api/axios';
import Notification from '../../components/Notification';

export default function AdminSettings({ darkMode = true, onClose, adminData = {}, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSecurity, setShowAddSecurity] = useState(false);
  const [securityList, setSecurityList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [profileData, setProfileData] = useState({
    name: adminData?.name || 'Admin User',
    email: adminData?.email || 'admin@devpass.edu',
    phone: adminData?.phone || '+63 912 345 6789',
    role: adminData?.role || 'System Administrator',
    joinDate: adminData?.joinDate || 'January 15, 2024',
    lastLogin: adminData?.lastLogin || 'Today, 09:45 AM'
  });

  // Update profileData when adminData changes
  useEffect(() => {
    if (adminData && Object.keys(adminData).length > 0) {
      setProfileData({
        name: adminData.name || 'Admin User',
        email: adminData.email || 'admin@devpass.edu',
        phone: adminData.phone || '+63 912 345 6789',
        role: adminData.role || 'System Administrator',
        joinDate: adminData.joinDate || 'January 15, 2024',
        lastLogin: adminData.lastLogin || 'Today, 09:45 AM'
      });
    }
  }, [adminData]);

  const [newSecurity, setNewSecurity] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    assignedGate: '',
    employeeId: '',
    shift: 'morning'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewStudent, setShowViewStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [editingSecurity, setEditingSecurity] = useState(null);
  const [showEditSecurity, setShowEditSecurity] = useState(false);
  const [securityToDelete, setSecurityToDelete] = useState(null);
  const [showDeleteSecurityConfirm, setShowDeleteSecurityConfirm] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [showEditStudentPassword, setShowEditStudentPassword] = useState(false);
  const [showEditStudentConfirmPassword, setShowEditStudentConfirmPassword] = useState(false);
  
  // Cache flags to prevent unnecessary refetches
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  // Animated background elements
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
    ? 'bg-white/10 border-white/20 focus:border-blue-500/50'
    : 'bg-white/60 border-white/40 focus:border-blue-500';

  // Fetch security and students (with caching)
  const fetchUsers = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (usersLoaded && !forceRefresh) {
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const [securityRes, studentsRes] = await Promise.all([
        api.get('/security-guards'),
        api.get('/students')
      ]);
      setSecurityList(securityRes.data || []);
      // Filter out admin and security accounts from students list
      const allStudents = studentsRes.data || [];
      const filteredStudents = allStudents.filter(student => {
        if (!student) return false;
        const studentId = student.id || student.studentId || '';
        const email = student.email || '';
        // Exclude admin account (ID: 22222222, email: admin@devpass.com)
        // Exclude security account (ID: 33333333, email: security@devpass.com)
        return studentId !== '22222222' && 
               studentId !== '33333333' && 
               !email.toLowerCase().includes('admin@devpass') && 
               !email.toLowerCase().includes('security@devpass');
      });
      setStudentList(filteredStudents);
      setUsersLoaded(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSecurityList([]);
      setStudentList([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const fetchCourses = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh (courses rarely change)
    if (coursesLoaded && !forceRefresh) {
      return;
    }
    
    try {
      // Try to fetch courses from API, if endpoint exists
      const response = await api.get('/courses').catch(() => null);
      if (response && response.data) {
        setCourses(response.data);
      } else {
        // Fallback to static course data
        setCourses([
          { course_id: '1', course_code: 'BSCE', course_name: 'Bachelor of Science in Civil Engineering' },
          { course_id: '2', course_code: 'BSCpE', course_name: 'Bachelor of Science in Computer Engineering' },
          { course_id: '3', course_code: 'BSEE', course_name: 'Bachelor of Science in Electrical Engineering' },
          { course_id: '4', course_code: 'BSECE', course_name: 'Bachelor of Science in Electronics Engineering' },
          { course_id: '5', course_code: 'BSME', course_name: 'Bachelor of Science in Mechanical Engineering' },
          { course_id: '6', course_code: 'BSCS', course_name: 'Bachelor of Science in Computer Science' },
          { course_id: '7', course_code: 'BSIT', course_name: 'Bachelor of Science in Information Technology' },
          { course_id: '8', course_code: 'BSIS', course_name: 'Bachelor of Science in Information Systems' },
          { course_id: '9', course_code: 'BSA', course_name: 'Bachelor of Science in Accountancy' },
          { course_id: '10', course_code: 'BSMA', course_name: 'Bachelor of Science in Management Accounting' },
        ]);
      }
      setCoursesLoaded(true);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use static fallback
      setCourses([
        { course_id: '1', course_code: 'BSCE', course_name: 'Bachelor of Science in Civil Engineering' },
        { course_id: '2', course_code: 'BSCpE', course_name: 'Bachelor of Science in Computer Engineering' },
      ]);
      setCoursesLoaded(true); // Mark as loaded even with fallback
    }
  };

  useEffect(() => {
    // Fetch users data when profile or users tab is active (for counts display)
    if (activeTab === 'users' || activeTab === 'profile') {
      fetchUsers();
      if (activeTab === 'users') {
        fetchCourses();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAddSecurity = async () => {
    // Validate form
    const newErrors = {};
    if (!newSecurity.name.trim()) newErrors.name = 'Name is required';
    if (!newSecurity.email.trim()) newErrors.email = 'Email is required';
    if (!newSecurity.password) newErrors.password = 'Password is required';
    if (!newSecurity.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (newSecurity.password && newSecurity.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (newSecurity.password !== newSecurity.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!newSecurity.phone.trim()) newErrors.phone = 'Phone is required';
    if (!newSecurity.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 25000)
      );
      
      await Promise.race([
        api.post('/security-guards', {
          guard_id: newSecurity.employeeId,
          name: newSecurity.name,
          email: newSecurity.email,
          phone: newSecurity.phone,
          password: newSecurity.password,
        }),
        timeoutPromise
      ]);
      
      setShowAddSecurity(false);
      setNewSecurity({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        assignedGate: '',
        employeeId: '',
        shift: 'morning'
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      fetchUsers(true); // Force refresh after adding
      
      setNotification({
        type: 'success',
        title: 'Success',
        message: 'Security personnel added successfully',
        autoClose: true,
      });
    } catch (error) {
      console.error('Error adding security:', error);
      let errorMessage = 'Failed to add security personnel';
      
      if (error.message === 'Request timeout. Please try again.') {
        errorMessage = error.message;
      } else if (error.response?.data) {
        if (error.response.data.errors) {
          const errorFields = Object.keys(error.response.data.errors);
          if (errorFields.length > 0) {
            errorMessage = error.response.data.errors[errorFields[0]][0];
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        type: 'error',
        title: 'Add Failed',
        message: errorMessage,
        autoClose: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSecurity = async () => {
    if (!securityToDelete) return;
    
    try {
      // Use guard_id (which is the login ID) for deletion
      const guardId = securityToDelete.guard_id || securityToDelete.id;
      await api.delete(`/security-guards/${guardId}`);
      setSecurityList(securityList.filter(security => security.guard_id !== guardId));
      setNotification({
        type: 'success',
        title: 'Deleted',
        message: 'Security account deleted successfully.',
        autoClose: true,
      });
      setShowDeleteSecurityConfirm(false);
      setSecurityToDelete(null);
      } catch (error) {
        console.error('Error deleting security:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete security account';
      setNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage,
        autoClose: true,
      });
    }
  };

  const handleSaveSecurity = async () => {
    if (!editingSecurity) return;
    
    const newErrors = {};
    if (!editingSecurity.name?.trim()) newErrors.name = 'Name is required';
    if (editingSecurity.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingSecurity.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password validation (only if password is provided)
    if (editingSecurity.password || editingSecurity.confirmPassword) {
      if (!editingSecurity.password || editingSecurity.password.trim().length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (editingSecurity.password !== editingSecurity.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: editingSecurity.name,
        email: editingSecurity.email || null,
        phone: editingSecurity.phone || null,
      };
      
      // Only include password if it's provided
      if (editingSecurity.password && editingSecurity.password.trim()) {
        updateData.password = editingSecurity.password;
      }
      
      await api.put(`/security-guards/${editingSecurity.guard_id}`, updateData);
      
      setNotification({
        type: 'success',
        title: 'Updated',
        message: 'Security account updated successfully.',
        autoClose: true,
      });
      
      setShowEditSecurity(false);
      setEditingSecurity(null);
      fetchUsers(true); // Force refresh after update
    } catch (error) {
      console.error('Error updating security:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update security account';
      setNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
        autoClose: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updateData = {
        name: profileData.name,
        phone: profileData.phone || null,
      };
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 25000)
      );
      
      const response = await Promise.race([
        api.put('/auth/profile', updateData),
        timeoutPromise
      ]);
      
      if (response && response.data && response.data.student) {
        setEditingProfile(false);
        setNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your name has been updated successfully.',
          autoClose: true,
        });
        
        // Call onUpdate callback to update dashboard
        if (onUpdate) {
          onUpdate(response.data.student);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.message === 'Request timeout. Please try again.') {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
        autoClose: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSecurity = securityList.filter(sec => {
    if (!sec) return false;
    const query = searchQuery.toLowerCase();
    return (
      sec.name?.toLowerCase().includes(query) ||
      sec.email?.toLowerCase().includes(query) ||
      sec.guard_id?.toString().toLowerCase().includes(query) ||
      sec.gate?.toLowerCase().includes(query)
    );
  });

  const filteredStudents = studentList.filter(student => {
    if (!student) return false;
    const query = searchQuery.toLowerCase();
    return (
      student.name?.toLowerCase().includes(query) ||
      (student.id || student.studentId)?.toString().toLowerCase().includes(query) ||
      (student.course?.course_name || student.course)?.toLowerCase().includes(query)
    );
  });

  if (!onClose) {
    console.error('AdminSettings: onClose prop is required');
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-10 w-80 h-80 ${darkMode ? 'bg-blue-600/20' : 'bg-blue-200/30'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-20 w-96 h-96 ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-200/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className={`${cardBg} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative z-10`}>
        {/* Header */}
        <div className="sticky top-0 bg-inherit border-b border-white/10 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>Settings & Management</h2>
              <p className={`text-xs sm:text-sm ${textSecondary}`}>Manage your account and system users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === 'profile'
                ? `${textPrimary} border-b-2 border-blue-500`
                : `${textSecondary} hover:${darkMode ? 'bg-white/5' : 'bg-gray-50'}`
            }`}
          >
            <div className="flex items-center justify-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              User Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === 'users'
                ? `${textPrimary} border-b-2 border-blue-500`
                : `${textSecondary} hover:${darkMode ? 'bg-white/5' : 'bg-gray-50'}`
            }`}
          >
            <div className="flex items-center cursor-pointer justify-center gap-2">
              <Users className="w-4 h-4" />
              Security & Students
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'profile' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Header */}
              <div className={`${cardBg} rounded-2xl p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                      {profileData.name?.charAt(0) || 'A'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl sm:text-3xl font-bold mb-2`}
                        placeholder="Enter your name"
                      />
                    ) : (
                    <h3 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>{profileData.name}</h3>
                    )}
                    <p className={`${textSecondary} mb-3`}>{profileData.role}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Active
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        Administrator
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                        <Key className="w-3 h-3 inline mr-1" />
                        Super User
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      editingProfile
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
                        : darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {editingProfile ? (
                      <div className="flex items-center cursor-pointer gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </div>
                    ) : (
                      <div className="flex items-center cursor-pointer gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`${cardBg} rounded-xl p-4 transition-all ${hoverCardBg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Security Personnel</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>{securityList.length}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Shield className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  </div>
                </div>
                <div className={`${cardBg} rounded-xl p-4 transition-all ${hoverCardBg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Registered Students</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>{studentList.length}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <GraduationCap className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                  </div>
                </div>
                {/* <div className={`${cardBg} rounded-xl p-4 transition-all ${hoverCardBg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Active Sessions</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>1</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                      <User className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Profile Details */}
              <div className={`${cardBg} rounded-2xl p-6`}>
                <h4 className={`text-lg font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                  <User className="w-5 h-5" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Mail className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Email Address</p>
                        {editingProfile ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className={`w-full px-3 py-2 mt-1 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                          />
                        ) : (
                          <p className={`font-semibold ${textPrimary} truncate`}>{profileData.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Phone className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Phone Number</p>
                        {editingProfile ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className={`w-full px-3 py-2 mt-1 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                          />
                        ) : (
                          <p className={`font-semibold ${textPrimary}`}>{profileData.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                        <Building className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Role</p>
                        <p className={`font-semibold ${textPrimary}`}>{profileData.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                        <Calendar className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Join Date</p>
                        <p className={`font-semibold ${textPrimary}`}>{profileData.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings
              <div className={`${cardBg} rounded-2xl p-6`}>
                <h4 className={`text-lg font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                  <Lock className="w-5 h-5" />
                  Security Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${cardBg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                        <Key className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>Change Password</p>
                        <p className={`text-xs ${textSecondary}`}>Update your password regularly</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
                  </button>
                  <button className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${cardBg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Shield className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>Two-Factor Authentication</p>
                        <p className={`text-xs ${textSecondary}`}>Add an extra layer of security</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
                  </button>
                </div>
              </div> */}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by name, ID, email, or course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${inputBg} ${textPrimary} placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex gap-3">
                  {/* <button className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/60 hover:bg-white/80 text-gray-900'}`}>
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/60 hover:bg-white/80 text-gray-900'}`}>
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Export</span>
                  </button> */}
                  <button
                    onClick={() => setShowAddSecurity(true)}
                    className="px-4 sm:px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Security</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              {/* Security Personnel */}
              <div className={`${cardBg} rounded-2xl p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                      <Shield className="w-6 h-6" />
                      Security Personnel
                      <span className={`text-sm font-normal ${textSecondary}`}>({filteredSecurity.length})</span>
                    </h3>
                    <p className={`text-sm ${textSecondary} mt-1`}>Manage security personnel accounts and assignments</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                      {securityList.filter(s => s && (s.status === 'active' || !s.status)).length} Active
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                      {securityList.filter(s => s && s.status === 'inactive').length} Inactive
                    </span>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : filteredSecurity.length === 0 ? (
                  <div className={`text-center py-8 ${cardBg} rounded-xl`}>
                    <Shield className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                    <p className={`${textSecondary}`}>No security personnel found</p>
                    <button
                      onClick={() => setShowAddSecurity(true)}
                      className="mt-4 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm"
                    >
                      Add First Security Personnel
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSecurity.map((security) => {
                      if (!security) return null;
                      const securityName = security.name || 'Unknown';
                      // Always use guard_id as it's the primary key and login ID
                      const securityId = security.guard_id || 'N/A';
                      const securityEmail = security.email || 'N/A';
                      const securityPhone = security.phone || 'N/A';
                      const securityGate = security.gate || security.assignedGate || null;
                      const securityStatus = security.status || 'active';
                      
                      return (
                        <div key={securityId} className={`${cardBg} rounded-xl p-4 transition-all ${hoverCardBg}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                                {securityName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className={`font-bold ${textPrimary}`}>{securityName}</h4>
                                <p className={`text-xs ${textSecondary}`}>ID: {securityId}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingSecurity({
                                    guard_id: securityId,
                                    name: securityName,
                                    email: securityEmail,
                                    phone: securityPhone,
                                    gate: securityGate,
                                    password: '',
                                    confirmPassword: ''
                                  });
                                  setShowEditSecurity(true);
                                  setShowEditPassword(false);
                                  setShowEditConfirmPassword(false);
                                  setErrors({});
                                }}
                                className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                title="Edit Security Personnel"
                              >
                              <Edit className={`w-4 h-4 ${textSecondary}`} />
                            </button>
                            <button 
                                onClick={() => {
                                  setSecurityToDelete({
                                    id: securityId, // This is guard_id, which is the login ID
                                    guard_id: securityId, // Also store as guard_id for clarity
                                    name: securityName
                                  });
                                  setShowDeleteSecurityConfirm(true);
                                }}
                              className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                                title="Delete Security Personnel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className={`w-3 h-3 ${textMuted}`} />
                              <span className={`text-xs ${textSecondary} truncate`}>{securityEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className={`w-3 h-3 ${textMuted}`} />
                              <span className={`text-xs ${textSecondary}`}>{securityPhone}</span>
                          </div>
                            {securityGate && (
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-3 h-3 ${textMuted}`} />
                                <span className={`text-xs ${textSecondary}`}>{securityGate}</span>
                          </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              securityStatus === 'active'
                              ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              : darkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
                          }`}>
                              {securityStatus === 'active' ? (
                              <>
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Active
                              </>
                            ) : 'Inactive'}
                          </span>
                            {security.lastActive && (
                          <span className={`text-xs ${textSecondary}`}>{security.lastActive}</span>
                            )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Registered Students */}
              <div className={`${cardBg} rounded-2xl p-4 sm:p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                      <GraduationCap className="w-6 h-6" />
                      Registered Students
                      <span className={`text-sm font-normal ${textSecondary}`}>({filteredStudents.length})</span>
                    </h3>
                    <p className={`text-sm ${textSecondary} mt-1`}>View and manage all registered students</p>
                  </div>
                  {/* <button className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export List
                  </button> */}
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className={`text-center py-8 ${cardBg} rounded-xl`}>
                    <GraduationCap className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
                    <p className={`${textSecondary}`}>No students found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Student ID</th>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Name</th>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Course</th>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Devices</th>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Status</th>
                          <th className={`text-left py-3 px-4 text-sm font-semibold ${textSecondary}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          if (!student) return null;
                          const studentName = student.name || 'Unknown';
                          const studentId = student.id || student.studentId || 'N/A';
                          const studentEmail = student.email || 'N/A';
                          // Get course name - show course code and name if available
                          const studentCourse = student.course 
                            ? (student.course.course_code && student.course.course_name 
                                ? `${student.course.course_code} - ${student.course.course_name}`
                                : student.course.course_name || student.course.course_code || 'N/A')
                            : (student.course_id ? `Course ID: ${student.course_id}` : 'N/A');
                          const studentStatus = student.status || 'inactive';
                          const registeredDevices = student.devices_count || student.registeredDevices || 0;
                          
                          return (
                            <tr 
                              key={studentId}
                            className={`border-b ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                          >
                            <td className="py-3 px-4">
                              <span className={`font-mono font-semibold text-sm ${textPrimary}`}>
                                  {studentId}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                                    {studentName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className={`font-medium ${textPrimary} block`}>{studentName}</span>
                                    <span className={`text-xs ${textSecondary}`}>{studentEmail}</span>
                                </div>
                              </div>
                            </td>
                              <td className={`py-3 px-4 ${textSecondary}`}>{studentCourse}</td>
                            <td className={`py-3 px-4`}>
                                <span 
                                  className={`font-semibold ${textPrimary} cursor-pointer hover:underline`}
                                  title={`Active: ${student.active_devices_count || 0}, Pending: ${student.pending_devices_count || 0}, Rejected: ${student.rejected_devices_count || 0}`}
                                >
                                  {registeredDevices}
                                </span>
                              <span className={`text-xs ${textSecondary} ml-1`}>device(s)</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  studentStatus === 'active'
                                  ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    : studentStatus === 'pending'
                                  ? darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                                    : studentStatus === 'rejected'
                                    ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                  : darkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
                              }`}>
                                  {studentStatus === 'active' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                  {studentStatus === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                                  {studentStatus === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                                  {studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setShowViewStudent(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                  title="View Student Details"
                                >
                                  <Eye className={`w-4 h-4 ${textSecondary}`} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingStudent({
                                      id: studentId,
                                      name: studentName,
                                      email: studentEmail,
                                      phone: student.phone || '',
                                      course_id: student.course_id || student.course?.course_id || '',
                                      year_of_study: student.year_of_study || '',
                                      password: '',
                                      confirmPassword: ''
                                    });
                                    setShowEditStudent(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                  title="Edit Student"
                                >
                                  <Edit className={`w-4 h-4 ${textSecondary}`} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Security Modal */}
      {showAddSecurity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <UserPlus className="w-6 h-6" />
                    Add Security Personnel
                  </h3>
                  <p className={`text-sm ${textSecondary} mt-1`}>Create a new security account</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddSecurity(false);
                    setNewSecurity({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      phone: '',
                      assignedGate: '',
                      employeeId: '',
                      shift: 'morning'
                    });
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setErrors({});
                  }}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              {errors.general && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Full Name *</label>
                  <input
                    type="text"
                    value={newSecurity.name}
                    onChange={(e) => setNewSecurity({...newSecurity, name: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Email Address *</label>
                  <input
                    type="email"
                    value={newSecurity.email}
                    onChange={(e) => setNewSecurity({...newSecurity, email: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Employee ID *</label>
                  <input
                    type="text"
                    value={newSecurity.employeeId}
                    onChange={(e) => setNewSecurity({...newSecurity, employeeId: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeId ? 'border-red-500' : ''}`}
                    placeholder="SEC001"
                  />
                  {errors.employeeId && <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Phone Number *</label>
                  <input
                    type="tel"
                    value={newSecurity.phone}
                    onChange={(e) => setNewSecurity({...newSecurity, phone: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+63 912 345 6789"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* <div className="grid grid-cols-2 gap-4"> */}
                  {/* <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Shift</label>
                    <select
                      value={newSecurity.shift}
                      onChange={(e) => setNewSecurity({...newSecurity, shift: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="morning">Morning (6AM - 2PM)</option>
                      <option value="afternoon">Afternoon (2PM - 10PM)</option>
                      <option value="night">Night (10PM - 6AM)</option>
                    </select>
                  </div> */}
                  {/* <div>
                    <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Assigned Gate</label>
                    <select
                      value={newSecurity.assignedGate}
                      onChange={(e) => setNewSecurity({...newSecurity, assignedGate: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select gate</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="Back Gate">Back Gate</option>
                      <option value="Side Gate">Side Gate</option>
                      <option value="East Gate">East Gate</option>
                      <option value="West Gate">West Gate</option>
                    </select>
                  </div> */}
                {/* </div> */}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newSecurity.password}
                      onChange={(e) => setNewSecurity({...newSecurity, password: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded`}
                    >
                      {showPassword ? (
                        <EyeOff className={`w-5 h-5 ${textMuted}`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${textMuted}`} />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={newSecurity.confirmPassword}
                      onChange={(e) => setNewSecurity({...newSecurity, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} rounded`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className={`w-5 h-5 ${textMuted}`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${textMuted}`} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddSecurity(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSecurity}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        {/* <Save className="w-4 h-4" /> */}
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Student Modal */}
      {showViewStudent && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <User className="w-6 h-6" />
                    Student Details
                  </h3>
                  <p className={`text-sm ${textSecondary} mt-1`}>View student information</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewStudent(false);
                    setSelectedStudent(null);
                  }}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${cardBg}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                      {(selectedStudent.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${textPrimary}`}>{selectedStudent.name || 'Unknown'}</h4>
                      <p className={`text-sm ${textSecondary}`}>{selectedStudent.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Student ID</p>
                    <p className={`font-semibold ${textPrimary}`}>{selectedStudent.id || selectedStudent.studentId || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Email</p>
                    <p className={`font-semibold ${textPrimary}`}>{selectedStudent.email || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Phone</p>
                    <p className={`font-semibold ${textPrimary}`}>{selectedStudent.phone || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Course</p>
                    <p className={`font-semibold ${textPrimary}`}>
                      {selectedStudent.course 
                        ? (selectedStudent.course.course_code && selectedStudent.course.course_name 
                            ? `${selectedStudent.course.course_code} - ${selectedStudent.course.course_name}`
                            : selectedStudent.course.course_name || selectedStudent.course.course_code || 'N/A')
                        : (selectedStudent.course_id ? `Course ID: ${selectedStudent.course_id}` : 'N/A')}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Year of Study</p>
                    <p className={`font-semibold ${textPrimary}`}>{selectedStudent.year_of_study || 'N/A'}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${cardBg}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Registered Devices</p>
                    <p className={`font-semibold ${textPrimary}`}>
                      {selectedStudent.devices_count || selectedStudent.registeredDevices || 0} device(s)
                    </p>
                    {(selectedStudent.active_devices_count || selectedStudent.pending_devices_count || selectedStudent.rejected_devices_count) && (
                      <div className={`text-xs ${textSecondary} mt-2 space-y-1`}>
                        {selectedStudent.active_devices_count > 0 && (
                          <p>Active: {selectedStudent.active_devices_count}</p>
                        )}
                        {selectedStudent.pending_devices_count > 0 && (
                          <p>Pending: {selectedStudent.pending_devices_count}</p>
                        )}
                        {selectedStudent.rejected_devices_count > 0 && (
                          <p>Rejected: {selectedStudent.rejected_devices_count}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowViewStudent(false);
                    setEditingStudent({
                      id: selectedStudent.id || selectedStudent.studentId,
                      name: selectedStudent.name || '',
                      email: selectedStudent.email || '',
                      phone: selectedStudent.phone || '',
                      course_id: selectedStudent.course_id || selectedStudent.course?.course_id || '',
                      year_of_study: selectedStudent.year_of_study || '',
                      password: '',
                      confirmPassword: ''
                    });
                    setShowEditStudent(true);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Student
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowViewStudent(false);
                    setSelectedStudent(null);
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && editingStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <Edit className="w-6 h-6" />
                    Edit Student
                  </h3>
                  <p className={`text-sm ${textSecondary} mt-1`}>Update student information</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditStudent(false);
                    setEditingStudent(null);
                  }}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={editingStudent.id}
                    disabled
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'} ${textPrimary} cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Course
                  </label>
                  <select
                    value={editingStudent.course_id}
                    onChange={(e) => setEditingStudent({...editingStudent, course_id: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Year of Study
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingStudent.year_of_study}
                    onChange={(e) => setEditingStudent({...editingStudent, year_of_study: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter year of study"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEditStudentPassword ? "text" : "password"}
                      value={editingStudent.password || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, password: e.target.value})}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditStudentPassword(!showEditStudentPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      {showEditStudentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  <p className={`text-xs mt-1 ${textSecondary}`}>
                    Leave blank to keep current password
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEditStudentConfirmPassword ? "text" : "password"}
                      value={editingStudent.confirmPassword || ''}
                      onChange={(e) => setEditingStudent({...editingStudent, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditStudentConfirmPassword(!showEditStudentConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      {showEditStudentConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => {
                    // Validate password if provided
                    const newErrors = {};
                    if (editingStudent.password || editingStudent.confirmPassword) {
                      if (!editingStudent.password || editingStudent.password.trim().length < 6) {
                        newErrors.password = 'Password must be at least 6 characters';
                      }
                      if (editingStudent.password !== editingStudent.confirmPassword) {
                        newErrors.confirmPassword = 'Passwords do not match';
                      }
                    }
                    
                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                      return;
                    }
                    
                    try {
                      setLoading(true);
                      const updateData = {
                        name: editingStudent.name,
                        email: editingStudent.email,
                        phone: editingStudent.phone,
                        course_id: editingStudent.course_id,
                        year_of_study: editingStudent.year_of_study ? parseInt(editingStudent.year_of_study) : null
                      };
                      
                      // Only include password if it's provided
                      if (editingStudent.password && editingStudent.password.trim()) {
                        updateData.password = editingStudent.password;
                      }
                      
                      await api.put(`/students/${editingStudent.id}`, updateData);
                      setNotification({
                        type: 'success',
                        message: 'Student information updated successfully!'
                      });
                      setShowEditStudent(false);
                      setEditingStudent(null);
                      setErrors({});
                      fetchUsers(true); // Force refresh after update
                    } catch (error) {
                      setNotification({
                        type: 'error',
                        message: error.response?.data?.message || 'Failed to update student information'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !editingStudent.name || !editingStudent.email}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    loading || !editingStudent.name || !editingStudent.email
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditStudent(false);
                    setEditingStudent(null);
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
          darkMode={darkMode} 
        />
      )}

      {/* Edit Security Modal */}
      {showEditSecurity && editingSecurity && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4`}>
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                  <Edit className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Security Personnel</h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Update security account information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditSecurity(false);
                  setEditingSecurity(null);
                  setErrors({});
                  setShowEditPassword(false);
                  setShowEditConfirmPassword(false);
                }}
                className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSecurity.name || ''}
                  onChange={(e) => setEditingSecurity({ ...editingSecurity, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Email
                </label>
                <input
                  type="email"
                  value={editingSecurity.email || ''}
                  onChange={(e) => setEditingSecurity({ ...editingSecurity, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  } ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingSecurity.phone || ''}
                  onChange={(e) => setEditingSecurity({ ...editingSecurity, phone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all ${
                    darkMode 
                      ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editingSecurity.password || ''}
                    onChange={(e) => setEditingSecurity({ ...editingSecurity, password: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    } ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${
                      darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Leave blank to keep current password
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showEditConfirmPassword ? "text" : "password"}
                    value={editingSecurity.confirmPassword || ''}
                    onChange={(e) => setEditingSecurity({ ...editingSecurity, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    } ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${
                      darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showEditConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowEditSecurity(false);
                    setEditingSecurity(null);
                    setErrors({});
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSecurity}
                  disabled={loading || !editingSecurity.name}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    loading || !editingSecurity.name
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Security Confirmation Modal */}
      {showDeleteSecurityConfirm && securityToDelete && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4`}>
          <div className={`${darkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl w-full max-w-md shadow-2xl`}>
            {/* Header */}
            <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg sm:rounded-xl shadow-lg">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Security Personnel</h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirm security account deletion</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteSecurityConfirm(false);
                  setSecurityToDelete(null);
                }}
                className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className={`${darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-1`}>
                      Warning: This action cannot be undone
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-red-300/80' : 'text-red-600/80'}`}>
                      Are you sure you want to delete the security account for <span className="font-semibold">{securityToDelete.name}</span>? This will permanently remove all associated data.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-semibold">Security Personnel:</span>
                </p>
                <div className="mt-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">Name:</span> {securityToDelete.name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-medium">ID (Login ID):</span> {securityToDelete.guard_id || securityToDelete.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteSecurityConfirm(false);
                    setSecurityToDelete(null);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSecurity}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}