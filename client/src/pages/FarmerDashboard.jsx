import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFarmerCredit, getProduceByFarmer } from '../services/api';
import { FiDollarSign, FiPackage, FiTrendingUp, FiCalendar, FiUser, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathSegment = location.pathname.split('/').pop();
  const section = ['transactions', 'credit', 'profile'].includes(pathSegment) ? pathSegment : 'overview';

  const [credit, setCredit] = useState(null);
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creditRes, produceRes] = await Promise.all([
          getFarmerCredit(user._id),
          getProduceByFarmer(user._id),
        ]);
        setCredit(creditRes.data.credit);
        setProduce(produceRes.data.produce);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Credit', value: `₹${(credit?.totalCredit || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Remaining Balance', value: `₹${(credit?.remainingBalance || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'bg-amber-100 text-amber-600' },
    { label: 'Produce Submitted', value: produce.length, icon: FiPackage, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Repaid', value: `₹${((credit?.totalCredit || 0) - (credit?.remainingBalance || 0)).toLocaleString()}`, icon: FiCalendar, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Farmer Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* ===== OVERVIEW ===== */}
      {section === 'overview' && (
        <>
          {/* Profile Card */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiUser className="text-white" size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  {user?.phone && <span className="flex items-center gap-1">📞 {user.phone}</span>}
                  {user?.landSize && <span className="flex items-center gap-1">🌾 {user.landSize}</span>}
                  {user?.location && <span className="flex items-center gap-1"><FiMapPin size={14} /> {user.location}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
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

          {/* Recent transactions preview */}
          <div>
            <h2 className="section-header mb-4">Recent Transactions</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Crop</th><th>Qty (kg)</th><th>Price/kg</th><th>Total</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {produce.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-400"><GiWheat className="mx-auto mb-2" size={28} />No produce submitted yet</td></tr>
                  ) : (
                    produce.slice(0, 5).map((p) => (
                      <tr key={p._id}>
                        <td className="font-medium text-gray-900">{p.cropType}</td>
                        <td>{p.quantity}</td>
                        <td>₹{p.price}</td>
                        <td className="font-semibold">₹{p.totalAmount?.toLocaleString()}</td>
                        <td className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td><span className={p.status === 'accepted' ? 'badge-green' : p.status === 'pending' ? 'badge-yellow' : 'badge-red'}>{p.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== TRANSACTIONS ===== */}
      {section === 'transactions' && (
        <div>
          <h2 className="section-header mb-4">All Transactions</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th><th>Quantity (kg)</th><th>Price/kg</th><th>Total</th><th>Center</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produce.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-gray-400"><GiWheat className="mx-auto mb-2" size={28} />No produce submitted yet</td></tr>
                ) : (
                  produce.map((p) => (
                    <tr key={p._id}>
                      <td className="font-medium text-gray-900">{p.cropType}</td>
                      <td>{p.quantity}</td>
                      <td>₹{p.price}</td>
                      <td className="font-semibold text-gray-900">₹{p.totalAmount?.toLocaleString()}</td>
                      <td className="text-gray-600">{p.centerId?.name || 'N/A'}</td>
                      <td className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td><span className={p.status === 'accepted' ? 'badge-green' : p.status === 'pending' ? 'badge-yellow' : 'badge-red'}>{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== CREDIT ===== */}
      {section === 'credit' && (
        <div className="space-y-6">
          {/* Credit summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><FiDollarSign size={22} /></div>
              <div><p className="text-2xl font-bold text-gray-900">₹{(credit?.totalCredit || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Total Credit</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><FiTrendingUp size={22} /></div>
              <div><p className="text-2xl font-bold text-gray-900">₹{((credit?.totalCredit || 0) - (credit?.remainingBalance || 0)).toLocaleString()}</p><p className="text-sm text-gray-500">Total Repaid</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><FiDollarSign size={22} /></div>
              <div><p className="text-2xl font-bold text-gray-900">₹{(credit?.remainingBalance || 0).toLocaleString()}</p><p className="text-sm text-gray-500">Remaining</p></div>
            </div>
          </div>

          {/* Repayment History */}
          <div>
            <h2 className="section-header mb-4">Repayment History</h2>
            {credit?.transactions?.length > 0 ? (
              <div className="space-y-3">
                {credit.transactions.map((tx, i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {tx.type === 'credit' ? <FiTrendingUp size={18} /> : <FiDollarSign size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-blue-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-gray-400">
                <FiDollarSign className="mx-auto mb-2" size={28} />
                No credit history yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PROFILE ===== */}
      {section === 'profile' && (
        <div className="max-w-2xl">
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiUser className="text-white" size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <span className="badge-green">Farmer</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiMail className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiPhone className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <GiWheat className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Land Size</p>
                  <p className="font-medium text-gray-900">{user?.landSize || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FiMapPin className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{user?.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
