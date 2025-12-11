import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, Zap, Shield, Rocket, Moon, Sun, Mail, GraduationCap, Calendar, X, ChevronRight, ChevronLeft, Check, Home as HomeIcon, Info, LogIn, Users, Globe, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, HelpCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import {motion} from 'framer-motion';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [registerStep, setRegisterStep] = useState(1);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();
  const staticCourseData = [
      {
        courseId: 1,
        courseCode: "BSCE",
        courseName: "Bachelor of Science in Civil Engineering",
      },
      {
        courseId: 2,
        courseCode: "BSCpE",
        courseName: "Bachelor of Science in Computer Engineering",
      },
      {
        courseId: 3,
        courseCode: "BSEE",
        courseName: "Bachelor of Science in Electrical Engineering",
      },
      {
        courseId: 4,
        courseCode: "BSECE",
        courseName: "Bachelor of Science in Electronics Engineering",
      },
      {
        courseId: 5,
        courseCode: "BSME",
        courseName: "Bachelor of Science in Mechanical Engineering",
      },
      {
        courseId: 6,
        courseCode: "BSCS",
        courseName: "Bachelor of Science in Computer Science",
      },
      {
        courseId: 7,
        courseCode: "BSIT",
        courseName: "Bachelor of Science in Information Technology",
      },
      {
        courseId: 8,
        courseCode: "BSIS",
        courseName: "Bachelor of Science in Information Systems",
      },
      {
        courseId: 9,
        courseCode: "BSA",
        courseName: "Bachelor of Science in Accountancy",
      },
      {
        courseId: 10,
        courseCode: "BSMA",
        courseName: "Bachelor of Science in Management Accounting",
      },
      {
        courseId: 11,
        courseCode: "BSBA-MM",
        courseName: "BSBA Major in Marketing Management",
      },
      {
        courseId: 12,
        courseCode: "BSBA-HRM",
        courseName: "BSBA Major in Human Resource Management",
      },
      {
        courseId: 13,
        courseCode: "BSEd",
        courseName: "Bachelor of Secondary Education",
      },
      {
        courseId: 14,
        courseCode: "BSN",
        courseName: "Bachelor of Science in Nursing",
      },
      {
        courseId: 15,
        courseCode: "BSCrim",
        courseName: "Bachelor of Science in Criminology",
      },
      {
        courseId: 16,
        courseCode: "BSMT",
        courseName: "Bachelor of Science in Marine Transportation",
      },
      {
        courseId: 17,
        courseCode: "BSMarE",
        courseName: "Bachelor of Science in Marine Engineering",
      },
      {
        courseId: 18,
        courseCode: "BS-Psych",
        courseName: "Bachelor of Science in Psychology",
      },
      {
        courseId: 19,
        courseCode: "BSPharm",
        courseName: "Bachelor of Science in Pharmacy",
      },
  ];
  // --- End Course Data ---

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    course_id: '',
    phone: '',
    year_of_study: '',
    password: '',
    password_confirmation: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRedirectPath = (user, userType = null) => {
    if (!user) return '/student/dashboard';
    
    // Check user_type first (most reliable)
    if (userType === 'security') {
      return '/personnel/dashboard';
    }
    
    // Check if it's a security guard (has guard_id field)
    if (user.guard_id) {
      return '/personnel/dashboard';
    }
    
    // Check if it's an admin
    const course = user.course?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    
    if (course === 'admin' || email.includes('admin@devpass')) {
      return '/admin/dashboard';
    }
    
    // Check if it's a security guard by course or email (for backward compatibility)
    if (course === 'security' || course === 'personnel' || email.includes('security@devpass')) {
      return '/personnel/dashboard';
    }
    
    // Default to student dashboard
    return '/student/dashboard';
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Add a small delay to prevent redirect loops
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (authService.isAuthenticated()) {
        const student = authService.getCurrentStudent();
        if (student) {
          // Get user_type from storage to properly identify security guards
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          const storage = rememberMe ? localStorage : sessionStorage;
          const userType = storage.getItem('user_type');
          const redirectPath = getRedirectPath(student, userType);
          // Only redirect if we're actually on the landing page
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/login') {
            // Check if security component is redirecting to prevent loops
            if (window.__securityRedirecting) {
              console.warn('Landing: Security component is redirecting, skipping auto-redirect');
              return;
            }
            // Check if we're already redirecting to prevent loops
            if (!window.__redirecting) {
              window.__redirecting = true;
              console.log('Landing: Redirecting authenticated user to', redirectPath);
              navigate(redirectPath);
              // Reset flag after navigation
              setTimeout(() => {
                window.__redirecting = false;
              }, 1000);
            } else {
              console.warn('Landing: Already redirecting, skipping');
            }
          }
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout. Please check your connection and try again.')), 25000)
      );
      
      if (isLogin) {
        const result = await Promise.race([
          authService.login({
            id: formData.id,
            password: formData.password,
          }, rememberMe),
          timeoutPromise
        ]);
        setMessage('✅ Login successful!');
        
        // Get user_type from result or storage
        const userType = result.user_type || (rememberMe ? localStorage.getItem('user_type') : sessionStorage.getItem('user_type'));
        const redirectPath = getRedirectPath(result.student, userType);
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
        
      } else {
        if (formData.password !== formData.password_confirmation) {
          setError('❌ Passwords do not match!');
          setLoading(false);
          return;
        }

        const result = await Promise.race([
          authService.register({
            id: formData.id,
            name: formData.name,
            email: formData.email,
            course_id: formData.course_id,
            phone: formData.phone,
            year_of_study: formData.year_of_study ? parseInt(formData.year_of_study) : null,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }),
          timeoutPromise
        ]);
        setMessage('✅ Registered successfully!');
        
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            id: '',
            name: '',
            email: '',
            course_id: '',
            phone: '',
            year_of_study: '',
            password: '',
            password_confirmation: '',
          });
          setRegisterStep(1);
        }, 1500);
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      let errorMessage = 'Operation failed';
      
      if (err.message === 'Request timeout. Please check your connection and try again.') {
        errorMessage = err.message;
      } else if (err.response?.data) {
        if (err.response.data.errors) {
          const errorFields = Object.keys(err.response.data.errors);
          if (errorFields.length > 0) {
            errorMessage = err.response.data.errors[errorFields[0]][0];
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (registerStep === 1) {
      if (!formData.name || !formData.email) {
        setError('❌ Please fill in all required fields');
        return;
      }
      setRegisterStep(2);
      setError('');
    } else if (registerStep === 2) {
      if (!formData.course_id) {
        setError('❌ Please fill in all required fields');
        return;
      }
      setRegisterStep(3);
      setError('');
    }
  };

  const prevStep = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1);
      setError('');
    }
  };

  const renderRegisterStep = () => {
    switch (registerStep) {
      case 1:
        return (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} />
                <input
                  name="name"
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} />
                <input
                  name="email"
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} />
                <input
                  name="id"
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="e.g., 23664035"
                  value={formData.id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 2:
  return (
    <motion.div
      key="register-step-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Course Selection */}
      <div>
        <label className={`block text-sm font-semibold ${formText} mb-3`}>
          Course <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <GraduationCap className={`absolute left-4 top-3.5 w-5 h-5 z-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            name="course_id"
            className={`w-full pl-12 pr-10 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
            value={formData.course_id}
            onChange={handleChange}
            required
          >
            <option value="" disabled className={darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-900'}>
              Select your course
            </option>
            {staticCourseData.map((course) => (
              <option 
                key={course.courseId} 
                value={course.courseId}
                className={darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}
              >
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
          <ChevronRight className={`absolute right-4 top-3.5 w-5 h-5 transform rotate-90 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <p className={`mt-2 text-xs ${formDescText}`}>
          Select your enrolled course from the list
        </p>
      </div>

      {/* Year of Study - Now full width on mobile */}
      <div>
        <label className={`block text-sm font-semibold ${formText} mb-3`}>
          Year of Study
        </label>
        <div className="relative">
          <Calendar className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            name="year_of_study"
            type="number"
            min="1"
            max="10"
            className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="Enter year (e.g., 3)"
            value={formData.year_of_study}
            onChange={handleChange}
          />
        </div>
        <p className={`mt-2 text-xs ${formDescText}`}>
          Optional - Enter your current year of study
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer shadow-lg"
        >
          <span className="hidden sm:inline">Next Step</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </motion.div>
  );
      case 3:
        return (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Phone Number
              </label>
              <div className="relative">
                <Phone className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} />
                <input
                  name="phone"
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="09123456789"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-4 pr-12 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-3.5 transition-colors ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${formText} mb-3`}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-4 pr-12 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-3.5 transition-colors ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const bgClass = darkMode 
    ? 'bg-black text-white' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900';
  
  const orbClass = darkMode
    ? 'bg-blue-600/20'
    : 'bg-blue-200/30';

  const formBg = darkMode
    ? 'backdrop-blur-2xl bg-white/5 border border-white/10'
    : 'backdrop-blur-xl bg-white/80 border border-white/60';
  
  const formText = darkMode ? 'text-gray-300' : 'text-gray-800';
  const formDescText = darkMode ? 'text-gray-400' : 'text-gray-600';
  
  const inputBg = darkMode
    ? 'bg-gray-900/50 border border-gray-800 text-white placeholder-gray-600'
    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500';

  const toggleBg = darkMode
    ? 'bg-gray-900/50 border border-gray-800'
    : 'bg-gray-100 border border-gray-300';

  const checkboxColor = darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-300';

  const navBg = darkMode
    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
    : 'bg-white/80 backdrop-blur-xl border-b border-gray-200';

  const navLinkActive = darkMode
    ? 'text-blue-400 border-blue-400'
    : 'text-blue-600 border-blue-600';

  const navLinkInactive = darkMode
    ? 'text-gray-400 hover:text-gray-200 border-transparent'
    : 'text-gray-600 hover:text-gray-800 border-transparent';

  

const renderHome = () => (
  <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-4">
    <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-0 items-center">
      {/* Left Side - Information */}
      <div className="lg:pr-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent"
            >
              DevPass
            </motion.h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`text-xl lg:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-light leading-relaxed`}
          >
            Next-gen QR-based device registration platform for seamless campus entry
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-5 mb-12"
        >
          {[
            {
              icon: <Zap className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />,
              title: "Digital Gate Pass",
              description: "Automated QR verification replaces manual processes instantly"
            },
            {
              icon: <Shield className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />,
              title: "Enhanced Security",
              description: "Real-time validation powered by centralized database"
            },
            {
              icon: <Rocket className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />,
              title: "Quick & Efficient",
              description: "Streamline operations and eliminate entry bottlenecks"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
              whileHover={{ x: 5 }}
              className="flex items-start gap-4 group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'} rounded-xl p-3 transition-all duration-300`}
              >
                {item.icon}
              </motion.div>
              <div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                  className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                  className={darkMode ? 'text-gray-400' : 'text-gray-600'}
                >
                  {item.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:pl-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${formBg} rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500`}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center mb-8"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className={`text-3xl lg:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {isLogin ? 'Welcome Back' : 'Join DevPass'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className={formDescText}
            >
              {isLogin ? 'Sign in to access your digital pass' : 'Create your account in seconds'}
            </motion.p>
          </motion.div>

          {/* Registration Steps Indicator */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mb-8"
            >
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={`flex-1 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} -translate-y-5 mx-2 origin-left`}
              >
                <motion.div
                  layout
                  className={`h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300`}
                  style={{ width: `${((registerStep - 1) / 2) * 100}%` }}
                ></motion.div>
              </motion.div>
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 + (step * 0.1) }}
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      layout
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        step === registerStep
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : step < registerStep
                          ? 'bg-green-500 text-white'
                          : darkMode
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step < registerStep ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring" }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        step
                      )}
                    </motion.div>
                    <span className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step === 1 ? 'Personal' : step === 2 ? 'Academic' : 'Security'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Toggle Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className={`flex gap-2 ${toggleBg} rounded-xl p-1 mb-8`}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsLogin(true);
                setRegisterStep(1);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsLogin(false);
                setRegisterStep(1);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                !isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Register
            </motion.button>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className={`block text-sm font-semibold ${formText} mb-3`}>
                    Student ID
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-3.5 w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`} />
                    <input
                      name="id"
                      type="text"
                      className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="e.g., 23664035"
                      value={formData.id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <label className={`block text-sm font-semibold ${formText} mb-3`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-4 pr-12 py-3 ${inputBg} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-3.5 transition-colors ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center justify-end"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className={`text-sm font-medium transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    Forgot password?
                  </motion.button>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderRegisterStep()}
              </motion.div>
            )}
          </form>

          {/* Success/Error Messages */}
          {(message || error) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 p-4 rounded ${message ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}
            >
              {message || error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className={formDescText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRegisterStep(1);
                }}
                className={`font-semibold cursor-pointer transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </div>
);

  const renderAbout = () => (
  <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center py-8">
    <div className="w-full max-w-7xl">
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent mb-4"
        >
          About DevPass
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-3xl mx-auto`}
        >
          Revolutionizing campus security with cutting-edge QR technology
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
  {
    icon: <Shield className="w-7 h-7 text-cyan-400" />,
    title: "Secure & Reliable",
    description: "Advanced encryption and real-time verification ensure maximum security for all campus entries.",
    gradient: "from-cyan-500 to-blue-600",
    delay: 0.3
  },
  {
    icon: <Zap className="w-7 h-7 text-cyan-400" />,
    title: "Lightning Fast",
    description: "Instant QR code generation and scanning reduces wait times by 90% compared to manual systems.",
    gradient: "from-cyan-500 to-blue-600",
    delay: 0.4
  },
  {
    icon: <Users className="w-7 h-7 text-cyan-400" />,
    title: "User-Friendly",
    description: "Intuitive interface designed for students, staff, and security personnel with minimal training required.",
    gradient: "from-cyan-500 to-blue-600",
    delay: 0.5
  }
].map((feature, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: feature.delay }}
    whileHover={{ 
      scale: 1.05,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
    className={`${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30 group-hover:bg-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60 group-hover:bg-cyan-200'} border rounded-2xl p-8 backdrop-blur-sm`}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: feature.delay + 0.1 }}
      className={`w-14 h-14 ${darkMode ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-cyan-100 border border-cyan-300/60'} rounded-xl flex items-center justify-center mb-6`}
    >
      {feature.icon}
    </motion.div>
    <motion.h3
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: feature.delay + 0.2 }}
      className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
    >
      {feature.title}
    </motion.h3>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: feature.delay + 0.3 }}
      className={darkMode ? 'text-gray-300' : 'text-gray-600'}
    >
      {feature.description}
    </motion.p>
  </motion.div>
))}
      </div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
        className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl p-8 backdrop-blur-sm`}
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Our Mission
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          DevPass was created to modernize campus security systems by replacing outdated manual processes with 
          a digital, efficient, and secure QR-based solution. We aim to enhance the campus experience for everyone 
          while maintaining the highest security standards.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap gap-4"
        >
          {[
            { color: "bg-blue-500", text: "5000+ Students Registered" },
            { color: "bg-green-500", text: "99.9% System Uptime" },
            { color: "bg-purple-500", text: "24/7 Support" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
              whileHover={{ x: 5 }}
              className="flex items-center gap-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 1 + (index * 0.1) }}
                className={`w-2 h-2 ${item.color} rounded-full`}
              ></motion.div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </div>
);

  return (
    <div className={`min-h-screen ${bgClass} overflow-hidden transition-colors duration-500`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 ${navBg}`}>
        <div className="w-full max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                  DevPass
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveSection('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-b-2 transition-all cursor-pointer ${
                    activeSection === 'home' ? navLinkActive : navLinkInactive
                  }`}
                >
                  <HomeIcon className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => setActiveSection('about')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-b-2 transition-all cursor-pointer ${
                    activeSection === 'about' ? navLinkActive : navLinkInactive
                  }`}
                >
                  <Info className="w-4 h-4" />
                  About
                </button>
              </div>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full backdrop-blur-xl transition-all duration-300 ${
                darkMode
                  ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                  : 'bg-gray-900/10 border border-gray-900/20 hover:bg-gray-900/20'
              }`}
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-400" />
              ) : (
                <Moon className="w-6 h-6 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-80 h-80 ${orbClass} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-40 right-20 w-96 h-96 ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-200/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute top-1/2 left-1/3 w-72 h-72 ${darkMode ? 'bg-cyan-600/10' : 'bg-cyan-200/20'} rounded-full blur-3xl animate-pulse`} style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {activeSection === 'home' ? renderHome() : renderAbout()}
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-200'} border-t`}>
        <div className="w-full max-w-7xl mx-auto py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                  DevPass
                </span>
              </div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Modernizing campus security with innovative QR technology.
              </p>
            </div>
            
            <div>
              <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveSection('home')} className={darkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>Home</button></li>
                <li><button onClick={() => setActiveSection('about')} className={darkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>About</button></li>
                <li><button onClick={() => {setActiveSection('home'); setIsLogin(true);}} className={darkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>Sign In</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>support@devpass.edu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>(123) 456-7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Campus Main Building</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Connect</h4>
              <div className="flex gap-4">
                <a href="#" className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                  <Facebook className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a href="#" className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                  <Twitter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a href="#" className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                  <Instagram className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
                <a href="#" className={`p-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                  <Linkedin className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </a>
              </div>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} text-center`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              © 2024 DevPass. All rights reserved. | Campus Security System
            </p>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForgotPasswordModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`${formBg} rounded-2xl w-full max-w-md shadow-2xl border`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-300/60'}`}>
                    <HelpCircle className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h2 className={`text-2xl font-bold ${formText}`}>Forgot Password?</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowForgotPasswordModal(false)}
                  className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        If you've forgotten your password, please contact the administrator to reset it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 ${formText}`}>Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${formDescText}`}>support@devpass.edu</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${formDescText}`}>(123) 456-7890</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${formDescText}`}>Campus Main Building</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs text-center ${formDescText}`}>
                  The administrator will assist you in resetting your password securely.
                </p>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 cursor-pointer"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);