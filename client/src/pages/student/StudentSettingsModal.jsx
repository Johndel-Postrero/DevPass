// StudentSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Camera,
  Edit,
  Save,
  Key,
  Calendar,
  CheckCircle,
  Building,
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import Notification from '../../components/Notification';

export default function StudentSettingsModal({ darkMode, onClose, studentData, onUpdate }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  // Get student ID from various possible properties
  const getStudentId = () => {
    return studentData?.studentId || 
           studentData?.id_number || 
           studentData?.student_id || 
           studentData?.id ||
           'N/A';
  };

  // Get course from various possible properties
  const getCourse = () => {
    return studentData?.course || 
           studentData?.program ||
           'Not specified';
  };

  // Format date if available
  const formatDate = (date) => {
    if (!date) return 'Not available';
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    return date;
  };

  const [profileData, setProfileData] = useState({
    name: studentData?.name || '',
    email: studentData?.email || '',
    phone: studentData?.phone || '',
    studentId: getStudentId(),
    course: getCourse(),
    joinDate: formatDate(studentData?.created_at || studentData?.joinDate || '')
  });

  // Update profileData when studentData changes
  useEffect(() => {
    if (studentData) {
      setProfileData({
        name: studentData?.name || '',
        email: studentData?.email || '',
        phone: studentData?.phone || '',
        studentId: getStudentId(),
        course: getCourse(),
        joinDate: formatDate(studentData?.created_at || studentData?.joinDate || '')
      });
    }
  }, [studentData]);

  const bgClass = darkMode 
    ? 'bg-black/50 backdrop-blur-sm' 
    : 'bg-black/50 backdrop-blur-sm';

  const cardBg = darkMode
    ? 'bg-black border border-white/10 backdrop-blur-xl'
    : 'bg-white border border-gray-200 backdrop-blur-xl';

  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const inputBg = darkMode
    ? 'bg-white/10 border-white/20 focus:border-blue-500/50'
    : 'bg-white/60 border-gray-300 focus:border-blue-500';

  const handleSaveProfile = async () => {
    // Validate password if provided
    const newErrors = {};
    if (password || confirmPassword) {
      if (!password || password.trim().length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const { authService } = await import('../../services/authService');
      
      const updateData = {};
      
      // Always include name and phone (they can be updated)
      updateData.name = profileData.name;
      updateData.phone = profileData.phone || null;
      
      // Only include password if it's provided
      if (password && password.trim()) {
        updateData.password = password;
      }
      
      const response = await authService.updateProfile(updateData);
      
      if (response && response.student) {
        // Update local storage with new student data
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('student', JSON.stringify(response.student));
        
        setEditingProfile(false);
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setNotification({
          type: 'success',
          title: 'Profile Updated',
          message: password ? 'Your profile and password have been updated successfully.' : 'Your profile has been updated successfully.',
          autoClose: true,
        });
        
        // Call onUpdate callback to update dashboard
        if (onUpdate) {
          onUpdate(response.student);
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
        autoClose: true,
      });
    }
  };

  return (
    <div className={`fixed inset-0 ${bgClass} z-50 flex items-center justify-center p-3 sm:p-4`}>
      <div className={`${cardBg} rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col relative z-10`}>
        {/* Header */}
        <div className="border-b border-white/10 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${textPrimary}`}>User Information</h2>
              <p className={`text-xs ${textSecondary}`}>View and manage your profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="flex flex-col">
            {/* Profile Header */}
            <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6`}>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {profileData.name.charAt(0)}
                  </div>
                  {/* <button 
                    onClick={() => alert('Upload profile picture feature coming soon!')}
                    className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button> */}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className={`px-3 py-2 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg sm:text-xl font-bold`}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <h3 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>{profileData.name}</h3>
                      )}
                      {editingProfile && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          Editing
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                      <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Active Student
                      </span>
                      <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        <Key className="w-3 h-3 inline mr-1" />
                        ID: {profileData.studentId}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
                    <div className="flex-1">
                      <p className={`text-sm ${textSecondary} mb-1`}>Course</p>
                      <p className={`font-semibold ${textPrimary} text-base truncate`}>{profileData.course}</p>
                    </div>
                    <button
                      onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
                        editingProfile
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
                          : darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {editingProfile ? (
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Edit className="w-4 h-4" />
                          <span>Edit Name</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Grid */}
            <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
              <div>
                <h4 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2 mb-4 sm:mb-6`}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Personal Information
                </h4>
                
                {/* 2-Column Grid for the 4 fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4 sm:space-y-6">
              

                  {/* Email - With working tooltip */}
                  <div className={`p-4 sm:p-5 rounded-lg sm:rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'} transition-all hover:${darkMode ? 'bg-white/10' : 'bg-white/80'} relative group`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                        <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className={`block text-xs ${textSecondary} mb-1`}>Email Address</label>
                        <p className={`font-semibold ${textPrimary} text-sm sm:text-base truncate`}>
                          {profileData.email || 'Not provided'}
                        </p>
                        
                        {/* Tooltip - Fixed positioning */}
                        {profileData.email && profileData.email.length > 25 && (
                          <div className="absolute left-0 right-0 -top-2 -translate-y-full px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg transform">
                            {profileData.email}
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-6 border-4 border-transparent border-t-black"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>


                    {/* Phone */}
                    <div className={`p-4 sm:p-5 rounded-lg sm:rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'} transition-all hover:${darkMode ? 'bg-white/10' : 'bg-white/80'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex-shrink-0`}>
                          <Phone className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <label className={`block text-xs ${textSecondary} mb-1`}>Phone Number</label>
                          <p className={`font-semibold ${textPrimary} text-sm sm:text-base`}>{profileData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Member Since */}
                    <div className={`p-4 sm:p-5 rounded-lg sm:rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/60'} transition-all hover:${darkMode ? 'bg-white/10' : 'bg-white/80'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} flex-shrink-0`}>
                          <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div className="flex-1">
                          <label className={`block text-xs ${textSecondary} mb-1`}>Member Since</label>
                          <p className={`font-semibold ${textPrimary} text-sm sm:text-base`}>{profileData.joinDate}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Password Change Section - Always visible */}
                <div className="mt-6 sm:mt-8">
                  <h4 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2 mb-4 sm:mb-6`}>
                    <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({...errors, password: ''});
                          }}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                          placeholder="Enter new password (leave blank to keep current)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          {showPassword ? (
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
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                          }}
                          className={`w-full px-4 py-3 pr-12 rounded-lg border ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'} flex items-start gap-2`}>
                    <span className="mt-0.5">ℹ️</span>
                    <span>Only your name and password can be edited. For changes to other information, please contact the administration office.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              Close
            </button>
            <button
              onClick={() => {
                if (editingProfile) {
                  handleSaveProfile();
                } else {
                  setEditingProfile(true);
                }
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                editingProfile
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              }`}
            >
              {editingProfile ? (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      {notification && (
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
          darkMode={darkMode} 
        />
      )}
    </div>
  );
}