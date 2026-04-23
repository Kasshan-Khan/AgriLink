import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProduceByCenter, createProduce, getFarmers } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { FiPackage, FiPlusCircle, FiUpload, FiCalendar, FiImage, FiHome, FiList } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split('/').pop();
  const section = pathSegment === 'add-produce' ? 'add-produce' : pathSegment === 'records' ? 'records' : 'overview';
  const [produce, setProduce] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(section === 'add-produce');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    farmerId: '', cropType: '', quantity: '', price: '', image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const centerId = user?.assignedCenter?._id || user?.assignedCenter;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (centerId) {
          const [produceRes, farmersRes] = await Promise.all([
            getProduceByCenter(centerId),
            getFarmers(),
          ]);
          setProduce(produceRes.data.produce);
          setFarmers(farmersRes.data.farmers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [centerId]);

  // Sync form visibility with URL
  useEffect(() => {
    setShowForm(section === 'add-produce');
  }, [section]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('centerId', centerId);
      formData.append('farmerId', form.farmerId);
      formData.append('cropType', form.cropType);
      formData.append('quantity', form.quantity);
      formData.append('price', form.price);
      if (form.image) formData.append('image', form.image);

      const { data } = await createProduce(formData);
      setProduce([data.produce, ...produce]);
      setForm({ farmerId: '', cropType: '', quantity: '', price: '', image: null });
      setImagePreview(null);
      setShowForm(false);
      toast.success('Produce entry added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add produce');
    } finally {
      setSubmitting(false);
    }
  };

  const todayProduce = produce.filter(
    (p) => new Date(p.createdAt).toDateString() === new Date().toDateString()
  );

  const totalQuantity = produce.reduce((sum, p) => sum + p.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!centerId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <GiWheat className="text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-600 mb-2">No Center Assigned</h2>
        <p className="text-gray-400">Please contact the admin to assign you to a collection center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">Center: {user?.assignedCenter?.name || 'Your Center'}</p>
        </div>
        {section !== 'add-produce' && (
          <button onClick={() => navigate('/manager/add-produce')} className="btn-primary flex items-center gap-2">
            <FiPlusCircle /> Add Produce Entry
          </button>
        )}
      </div>

      {/* ===== OVERVIEW SECTION ===== */}
      {section === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FiPackage size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{produce.length}</p>
                <p className="text-sm text-gray-500">Total Entries</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <GiWheat size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()} kg</p>
                <p className="text-sm text-gray-500">Total Collected</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <FiCalendar size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayProduce.length}</p>
                <p className="text-sm text-gray-500">Today's Entries</p>
              </div>
            </div>
          </div>

          {/* Recent records preview */}
          <div>
            <h2 className="section-header mb-4">Recent Records</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Qty (kg)</th>
                    <th>Price/kg</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {produce.slice(0, 5).map((p) => (
                    <tr key={p._id}>
                      <td className="font-medium text-gray-900">{p.farmerId?.name || 'Unknown'}</td>
                      <td>{p.cropType}</td>
                      <td>{p.quantity}</td>
                      <td>₹{p.price}</td>
                      <td className="font-semibold">₹{p.totalAmount?.toLocaleString()}</td>
                      <td className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={
                          p.status === 'accepted' ? 'badge-green' :
                          p.status === 'pending' ? 'badge-yellow' : 'badge-red'
                        }>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== ADD PRODUCE SECTION ===== */}
      {section === 'add-produce' && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-header mb-4">New Produce Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Farmer</label>
              <select
                required
                value={form.farmerId}
                onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Farmer</option>
                {farmers.map((f) => (
                  <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop Type</label>
              <select
                required
                value={form.cropType}
                onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                className="input-field"
              >
                <option value="">Select Crop</option>
                {['Wheat', 'Rice', 'Potato', 'Onion'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Quantity (kg)</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field"
                placeholder="e.g., 250"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Price per kg (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="e.g., 25"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Produce Image</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                  <FiUpload className="text-gray-400" />
                  <span className="text-sm text-gray-500">{form.image ? form.image.name : 'Click to upload image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FiPlusCircle /> Submit Entry</>
                )}
              </button>
              <button type="button" onClick={() => navigate('/manager')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== RECORDS SECTION ===== */}
      {section === 'records' && (
        <div>
          <h2 className="section-header mb-4">All Records</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Qty (kg)</th>
                  <th>Price/kg</th>
                  <th>Total</th>
                  <th>Image</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produce.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-400">
                      <FiPackage className="mx-auto mb-2" size={28} />
                      No records yet
                    </td>
                  </tr>
                ) : (
                  produce.map((p) => (
                    <tr key={p._id}>
                      <td className="font-medium text-gray-900">{p.farmerId?.name || 'Unknown'}</td>
                      <td>{p.cropType}</td>
                      <td>{p.quantity}</td>
                      <td>₹{p.price}</td>
                      <td className="font-semibold">₹{p.totalAmount?.toLocaleString()}</td>
                      <td>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.cropType} onClick={() => window.open(p.imageUrl, '_blank')} className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform" />
                        ) : (
                          <FiImage className="text-gray-300" size={20} />
                        )}
                      </td>
                      <td className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={
                          p.status === 'accepted' ? 'badge-green' :
                          p.status === 'pending' ? 'badge-yellow' : 'badge-red'
                        }>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
