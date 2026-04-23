import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getCenters, createCenter, deleteCenter, assignManager,
  getAllProduce, getProduceStats, getCreditStats, getUserStats,
  getUsers, getFarmers, createManager, issueCredit, recordRepayment,
} from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiMapPin, FiUsers, FiPackage, FiDollarSign, FiPlusCircle,
  FiTrash2, FiBarChart2, FiImage, FiDownload, FiTrendingUp, FiUserPlus
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split('/').pop();
  const tab = ['centers', 'produce', 'credits', 'users', 'analytics'].includes(pathSegment) ? pathSegment : 'overview';
  const setTab = (t) => navigate(t === 'overview' ? '/admin' : `/admin/${t}`);
  const [centers, setCenters] = useState([]);
  const [produce, setProduce] = useState([]);
  const [produceStats, setProduceStats] = useState(null);
  const [creditStats, setCreditStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Center form
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [centerForm, setCenterForm] = useState({ name: '', address: '', lat: '', lng: '' });

  // Credit form
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditForm, setCreditForm] = useState({ farmerId: '', amount: '', description: '', type: 'credit' });

  // Filters
  const [produceFilter, setProduceFilter] = useState({ cropType: '', centerId: '' });

  // Manager form
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managerForm, setManagerForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [centersR, produceR, pStatsR, cStatsR, uStatsR, usersR, farmersR] = await Promise.all([
        getCenters(),
        getAllProduce(),
        getProduceStats(),
        getCreditStats(),
        getUserStats(),
        getUsers(),
        getFarmers(),
      ]);
      setCenters(centersR.data.centers);
      setProduce(produceR.data.produce);
      setProduceStats(pStatsR.data);
      setCreditStats(cStatsR.data);
      setUserStats(uStatsR.data);
      setUsers(usersR.data.users);
      setFarmers(farmersR.data.farmers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      await createCenter({ ...centerForm, lat: parseFloat(centerForm.lat), lng: parseFloat(centerForm.lng) });
      toast.success('Center created!');
      setCenterForm({ name: '', address: '', lat: '', lng: '' });
      setShowCenterForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteCenter = async (id) => {
    if (!window.confirm('Delete this center?')) return;
    try {
      await deleteCenter(id);
      toast.success('Center deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAssignManager = async (centerId, managerId) => {
    try {
      await assignManager(centerId, { managerId });
      toast.success('Manager assigned!');
      fetchAll();
    } catch (err) {
      toast.error('Failed to assign');
    }
  };

  const handleCreditAction = async (e) => {
    e.preventDefault();
    try {
      if (creditForm.type === 'credit') {
        await issueCredit({ farmerId: creditForm.farmerId, amount: parseFloat(creditForm.amount), description: creditForm.description });
      } else {
        await recordRepayment({ farmerId: creditForm.farmerId, amount: parseFloat(creditForm.amount), description: creditForm.description });
      }
      toast.success(creditForm.type === 'credit' ? 'Credit issued!' : 'Repayment recorded!');
      setCreditForm({ farmerId: '', amount: '', description: '', type: 'credit' });
      setShowCreditForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const exportCSV = () => {
    const rows = produce.map(p => ({
      Farmer: p.farmerId?.name || '',
      Crop: p.cropType,
      Quantity: p.quantity,
      Price: p.price,
      Total: p.totalAmount,
      Center: p.centerId?.name || '',
      Date: new Date(p.createdAt).toLocaleDateString(),
      Status: p.status,
    }));
    const header = Object.keys(rows[0] || {}).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrilink_produce_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const managers = users.filter(u => u.role === 'manager');

  const filteredProduce = produce.filter(p => {
    if (produceFilter.cropType && p.cropType !== produceFilter.cropType) return false;
    if (produceFilter.centerId && p.centerId?._id !== produceFilter.centerId) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-center" />

      <div>
        <h1 className="page-header">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Full platform overview and management</p>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Centers', value: centers.length, icon: FiMapPin, color: 'bg-blue-100 text-blue-600' },
              { label: 'Farmers', value: userStats?.totalFarmers || 0, icon: FiUsers, color: 'bg-green-100 text-green-600' },
              { label: 'Total Produce', value: `${(produceStats?.totalQuantity || 0).toLocaleString()} kg`, icon: FiPackage, color: 'bg-amber-100 text-amber-600' },
              { label: 'Credit Given', value: `₹${(creditStats?.totalCreditGiven || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-purple-100 text-purple-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick chart */}
          {produceStats?.perCenter?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="section-header mb-4">Produce by Center</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={produceStats.perCenter}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="centerName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" fill="#16a34a" radius={[6, 6, 0, 0]} name="Quantity (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Credit overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{(creditStats?.totalRecovered || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Credit Recovered</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <FiDollarSign size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{(creditStats?.totalRemaining || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Outstanding</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{creditStats?.farmersWithCredit || 0}</p>
                <p className="text-sm text-gray-500">Farmers with Credit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CENTERS TAB ===== */}
      {tab === 'centers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="section-header">Collection Centers</h2>
            <button onClick={() => setShowCenterForm(!showCenterForm)} className="btn-primary flex items-center gap-2">
              <FiPlusCircle /> Add Center
            </button>
          </div>

          {showCenterForm && (
            <form onSubmit={handleCreateCenter} className="glass-card p-6 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                  <input required value={centerForm.name} onChange={e => setCenterForm({...centerForm, name: e.target.value})} className="input-field" placeholder="Center name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                  <input required value={centerForm.address} onChange={e => setCenterForm({...centerForm, address: e.target.value})} className="input-field" placeholder="Full address" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</label>
                  <input required type="number" step="any" value={centerForm.lat} onChange={e => setCenterForm({...centerForm, lat: e.target.value})} className="input-field" placeholder="20.5937" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</label>
                  <input required type="number" step="any" value={centerForm.lng} onChange={e => setCenterForm({...centerForm, lng: e.target.value})} className="input-field" placeholder="78.9629" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">Create Center</button>
                <button type="button" onClick={() => setShowCenterForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Coordinates</th>
                  <th>Manager</th>
                  <th>Assign Manager</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-gray-900">{c.name}</td>
                    <td className="text-gray-600 text-xs max-w-[200px] truncate">{c.address}</td>
                    <td className="text-xs text-gray-500">{c.location.lat.toFixed(4)}, {c.location.lng.toFixed(4)}</td>
                    <td>{c.managerId ? <span className="badge-green">{c.managerId.name}</span> : <span className="badge-yellow">Unassigned</span>}</td>
                    <td>
                      <select
                        value={c.managerId?._id || ''}
                        onChange={(e) => handleAssignManager(c._id, e.target.value)}
                        className="input-field text-xs py-1.5 px-2"
                      >
                        <option value="">Select...</option>
                        {managers.map(m => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteCenter(c._id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PRODUCE TAB ===== */}
      {tab === 'produce' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="section-header">All Produce Entries</h2>
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <FiDownload /> Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select value={produceFilter.cropType} onChange={e => setProduceFilter({...produceFilter, cropType: e.target.value})} className="input-field w-auto text-sm">
              <option value="">All Crops</option>
              {[...new Set(produce.map(p => p.cropType))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={produceFilter.centerId} onChange={e => setProduceFilter({...produceFilter, centerId: e.target.value})} className="input-field w-auto text-sm">
              <option value="">All Centers</option>
              {centers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Qty (kg)</th>
                  <th>Price/kg</th>
                  <th>Total</th>
                  <th>Center</th>
                  <th>Image</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduce.map((p) => (
                  <tr key={p._id}>
                    <td className="font-medium text-gray-900">{p.farmerId?.name}</td>
                    <td>{p.cropType}</td>
                    <td>{p.quantity}</td>
                    <td>₹{p.price}</td>
                    <td className="font-semibold">₹{p.totalAmount?.toLocaleString()}</td>
                    <td className="text-gray-600">{p.centerId?.name}</td>
                    <td>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.cropType} onClick={() => window.open(p.imageUrl, '_blank')} className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-150 transition-transform" />
                      ) : (
                        <FiImage className="text-gray-300" />
                      )}
                    </td>
                    <td className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td><span className={p.status === 'accepted' ? 'badge-green' : p.status === 'pending' ? 'badge-yellow' : 'badge-red'}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== CREDITS TAB ===== */}
      {tab === 'credits' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="section-header">Credit Management</h2>
            <button onClick={() => setShowCreditForm(!showCreditForm)} className="btn-primary flex items-center gap-2">
              <FiDollarSign /> Issue / Repay
            </button>
          </div>

          {showCreditForm && (
            <form onSubmit={handleCreditAction} className="glass-card p-6 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Action</label>
                  <select value={creditForm.type} onChange={e => setCreditForm({...creditForm, type: e.target.value})} className="input-field">
                    <option value="credit">Issue Credit</option>
                    <option value="repayment">Record Repayment</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Farmer</label>
                  <select required value={creditForm.farmerId} onChange={e => setCreditForm({...creditForm, farmerId: e.target.value})} className="input-field">
                    <option value="">Select Farmer</option>
                    {farmers.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₹)</label>
                  <input required type="number" min="1" value={creditForm.amount} onChange={e => setCreditForm({...creditForm, amount: e.target.value})} className="input-field" placeholder="5000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <input value={creditForm.description} onChange={e => setCreditForm({...creditForm, description: e.target.value})} className="input-field" placeholder="Reason for transaction" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">{creditForm.type === 'credit' ? 'Issue Credit' : 'Record Repayment'}</button>
                <button type="button" onClick={() => setShowCreditForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><FiDollarSign size={22} /></div>
              <div><p className="text-2xl font-bold">₹{(creditStats?.totalCreditGiven || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Total Given</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><FiTrendingUp size={22} /></div>
              <div><p className="text-2xl font-bold">₹{(creditStats?.totalRecovered || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Recovered</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><FiDollarSign size={22} /></div>
              <div><p className="text-2xl font-bold">₹{(creditStats?.totalRemaining || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Outstanding</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="section-header">All Users</h2>
            <button onClick={() => setShowManagerForm(!showManagerForm)} className="btn-primary flex items-center gap-2">
              <FiUserPlus /> Add Manager
            </button>
          </div>

          {showManagerForm && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createManager(managerForm);
                toast.success('Manager created successfully!');
                setManagerForm({ name: '', email: '', phone: '', password: '' });
                setShowManagerForm(false);
                fetchAll();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to create manager');
              }
            }} className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-gray-800 mb-4">New Manager Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                  <input required value={managerForm.name} onChange={e => setManagerForm({...managerForm, name: e.target.value})} className="input-field" placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input required type="email" value={managerForm.email} onChange={e => setManagerForm({...managerForm, email: e.target.value})} className="input-field" placeholder="manager@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  <input value={managerForm.phone} onChange={e => setManagerForm({...managerForm, phone: e.target.value})} className="input-field" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                  <input required type="password" minLength={6} value={managerForm.password} onChange={e => setManagerForm({...managerForm, password: e.target.value})} className="input-field" placeholder="Min 6 characters" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">Create Manager</button>
                <button type="button" onClick={() => setShowManagerForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Land Size</th><th>Location</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="font-medium text-gray-900">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={u.role === 'admin' ? 'badge-red' : u.role === 'manager' ? 'badge-blue' : 'badge-green'}>{u.role}</span></td>
                    <td>{u.landSize || '—'}</td>
                    <td className="text-gray-600 text-xs">{u.location || '—'}</td>
                    <td className="text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="section-header">Analytics & Reports</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per center volume */}
            {produceStats?.perCenter?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Volume by Center</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={produceStats.perCenter}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="centerName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="totalQuantity" fill="#16a34a" radius={[6, 6, 0, 0]} name="Quantity (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Value by center pie */}
            {produceStats?.perCenter?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Value Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={produceStats.perCenter}
                      dataKey="totalValue"
                      nameKey="centerName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ centerName, percent }) => `${centerName} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {produceStats.perCenter.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly trends */}
            {produceStats?.monthlyTrends?.length > 0 && (
              <div className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={produceStats.monthlyTrends.map(t => ({
                      month: `${t._id.month}/${t._id.year}`,
                      quantity: t.totalQuantity,
                      value: t.totalValue,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="quantity" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Quantity (kg)" />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Value (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
