import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiFarmTractor } from 'react-icons/gi';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', landSize: '', location: '', companyName: '', gstNumber: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role };
      const { data } = await registerUser(payload);
      login(data.token, data.user);
      toast.success('Account created successfully!');
      setTimeout(() => navigate(role === 'buyer' ? '/buyer' : '/farmer'), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const farmerFields = [
    { name: 'name', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'Suresh Yadav', required: true },
    { name: 'email', label: 'Email', icon: FiMail, type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'phone', label: 'Phone', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210', required: false },
    { name: 'landSize', label: 'Land Size', icon: GiFarmTractor, type: 'text', placeholder: 'e.g., 5 acres', required: false },
    { name: 'location', label: 'Location', icon: FiMapPin, type: 'text', placeholder: 'Village, District, State', required: false },
  ];

  const buyerFields = [
    { name: 'name', label: 'Contact Name', icon: FiUser, type: 'text', placeholder: 'Rahul Sharma', required: true },
    { name: 'companyName', label: 'Company / Business Name', icon: FiUser, type: 'text', placeholder: 'Fresh Foods Ltd.', required: true },
    { name: 'email', label: 'Email', icon: FiMail, type: 'email', placeholder: 'you@business.com', required: true },
    { name: 'phone', label: 'Phone', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210', required: true },
    { name: 'gstNumber', label: 'GST Number', icon: FiUser, type: 'text', placeholder: '22AAAAA0000A1Z5', required: false },
    { name: 'location', label: 'Business Address', icon: FiMapPin, type: 'text', placeholder: 'City, State, Pincode', required: true },
  ];

  const activeFields = role === 'farmer' ? farmerFields : buyerFields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-emerald-800 to-green-900 flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" />
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <GiWheat className="text-yellow-300 text-xl" />
          </div>
          <span className="text-2xl font-bold text-white">Agri<span className="text-primary-300">Link</span></span>
        </Link>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Create Account</h2>
          <p className="text-gray-500 text-center mb-6">Join AgriLink today</p>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole('farmer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'farmer' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I'm a Farmer
            </button>
            <button
              onClick={() => setRole('buyer')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'buyer' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I'm a Buyer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeFields.map(({ name, label, icon: Icon, type, placeholder, required }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={type}
                    name={name}
                    required={required}
                    value={form[name]}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <FiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
