import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAvailableStock, placeOrder, getMyOrders, getBuyerPrice } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { FiPackage, FiShoppingBag, FiTruck, FiMapPin, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split('/').pop();
  const tab = ['stock', 'orders', 'profile'].includes(pathSegment) ? pathSegment : 'overview';
  
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    cropType: '',
    centerId: '',
    quantity: '',
    orderType: 'immediate',
    logistics: 'partner', // Default to delivery since they mentioned costs
    deliveryAddress: user?.location || '',
    postalCode: '',
    distance: '1', // Default 1km for base fee
  });
  const [orderPreview, setOrderPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 'overview' || tab === 'stock') {
        const { data } = await getAvailableStock();
        setStock(data);
      }
      if (tab === 'overview' || tab === 'orders') {
        const { data } = await getMyOrders();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // When order form changes, try to fetch pricing for preview calculate
  useEffect(() => {
    if (showOrderModal && orderForm.cropType && orderForm.quantity) {
      const getPricing = async () => {
        try {
          const { data } = await getBuyerPrice({ cropType: orderForm.cropType, centerId: orderForm.centerId || undefined });
          const base = data.finalPrice; // Base + 2.5
          const delivery = orderForm.logistics === 'partner' ? Math.ceil(Number(orderForm.distance || 1) / 150) * 5 : 0;
          const finalCostPerKg = base + delivery;
          const totalAmount = finalCostPerKg * (parseFloat(orderForm.quantity) || 0);
          setOrderPreview({ finalCostPerKg, totalAmount, margin: 2.5, base: data.basePrice, delivery });
        } catch (err) {
          setOrderPreview(null);
        }
      };
      getPricing();
    } else {
      setOrderPreview(null);
    }
  }, [showOrderModal, orderForm.cropType, orderForm.centerId, orderForm.quantity, orderForm.logistics, orderForm.distance]);

  const handleOpenOrder = (s = null) => {
    if (s) {
      setOrderForm({
        cropType: s.cropType,
        centerId: s.centerId,
        quantity: s.availableQuantity, // Default to max
        orderType: 'immediate',
        logistics: 'partner',
        deliveryAddress: user?.location || '',
        postalCode: '',
        distance: '1',
      });
    } else {
      setOrderForm({
        cropType: 'Wheat',
        centerId: '',
        quantity: '',
        orderType: 'preorder',
        logistics: 'partner',
        deliveryAddress: user?.location || '',
        postalCode: '',
        distance: '1',
      });
    }
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      await placeOrder({
        ...orderForm,
        quantity: parseFloat(orderForm.quantity),
      });
      toast.success('Order placed successfully!');
      setShowOrderModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-center" />
      <div>
        <h1 className="page-header">Buyer Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your orders and browse fresh stock</p>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><FiPackage size={22} /></div>
              <div><p className="text-2xl font-bold">{orders.length}</p><p className="text-sm text-gray-500">Total Orders</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center"><FiTruck size={22} /></div>
              <div><p className="text-2xl font-bold">{pendingOrders}</p><p className="text-sm text-gray-500">Pending Deliveries</p></div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><FiShoppingBag size={22} /></div>
              <div><p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p><p className="text-sm text-gray-500">Total Spent</p></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="section-header">Available Stock (Immediate Orders)</h2>
            <button onClick={() => handleOpenOrder(null)} className="btn-secondary">Place Pre-Order</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stock.map((s, idx) => (
              <div key={idx} className="glass-card p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{s.cropType}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FiMapPin size={14}/> {s.centerName}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-emerald-200 rounded-xl flex items-center justify-center">
                    <GiWheat className="text-primary-600 text-xl" />
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-lg font-semibold text-gray-800">{s.availableQuantity} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-xl font-bold text-primary-600">₹{s.finalPricePerKg}/kg</p>
                  </div>
                </div>
                <button onClick={() => handleOpenOrder(s)} className="btn-primary w-full mt-4 flex justify-center gap-2">
                  <FiShoppingBag /> Order Now
                </button>
              </div>
            ))}
            {stock.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                No stock currently available. Check back soon or place a pre-order.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="section-header">My Orders</h2>
            <button onClick={() => handleOpenOrder(null)} className="btn-primary">New Order</button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Crop</th>
                  <th>Type</th>
                  <th>Qty (kg)</th>
                  <th>Logistics</th>
                  <th>Total (₹)</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="font-mono text-xs text-gray-500">{o._id.slice(-6).toUpperCase()}</td>
                    <td className="font-medium text-gray-900">{o.items[0]?.cropType}</td>
                    <td><span className={o.orderType === 'preorder' ? 'badge-blue' : 'badge-green'}>{o.orderType}</span></td>
                    <td>{o.items[0]?.quantity}</td>
                    <td>{o.logistics === 'partner' ? 'AgriLink Partner' : 'Self Pickup'}</td>
                    <td className="font-bold">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge-${o.status === 'delivered' ? 'green' : o.status === 'pending' ? 'yellow' : o.status === 'cancelled' ? 'red' : 'blue'}`}>{o.status}</span></td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="8" className="text-center py-4 text-gray-500">You haven't placed any orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="max-w-2xl glass-card p-8">
          <h2 className="section-header mb-6">Business Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Contact Name</p><p className="font-medium text-gray-900">{user?.name}</p></div>
              <div><p className="text-sm text-gray-500">Company Name</p><p className="font-medium text-gray-900">{user?.companyName || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-900">{user?.email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium text-gray-900">{user?.phone || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">GST Number</p><p className="font-medium text-gray-900">{user?.gstNumber || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Address</p><p className="font-medium text-gray-900">{user?.location || 'N/A'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {orderForm.orderType === 'immediate' ? `Order ${orderForm.cropType}` : 'Place Pre-Order'}
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
              {orderForm.orderType === 'immediate' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Crop Type</label>
                    <input disabled value={orderForm.cropType} className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Quantity (kg)</label>
                    <input required type="number" min="1" max={orderForm.quantity} defaultValue={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} className="input-field" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Crop Type</label>
                    <select required value={orderForm.cropType} onChange={e => setOrderForm({...orderForm, cropType: e.target.value})} className="input-field">
                      <option value="Wheat">Wheat</option>
                      <option value="Rice">Rice</option>
                      <option value="Potato">Potato</option>
                      <option value="Onion">Onion</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Quantity (kg)</label>
                    <input required type="number" min="1" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} className="input-field" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Postal Code</label>
                  <input required type="text" value={orderForm.postalCode} onChange={e => setOrderForm({...orderForm, postalCode: e.target.value})} className="input-field" placeholder="Pincode" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Complete Address</label>
                  <input required type="text" value={orderForm.deliveryAddress} onChange={e => setOrderForm({...orderForm, deliveryAddress: e.target.value})} className="input-field" placeholder="Street, City, State" />
                </div>
              </div>

              {/* Keep logistics toggle but simplified/hidden if user strictly wants only those fields? 
                  I'll keep it as a small toggle to let them switch to pickup if they want, but default to Partner Delivery */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="logistics" value="partner" checked={orderForm.logistics === 'partner'} onChange={() => setOrderForm({...orderForm, logistics: 'partner'})} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">AgriLink Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="logistics" value="own" checked={orderForm.logistics === 'own'} onChange={() => setOrderForm({...orderForm, logistics: 'own'})} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">Self Pickup</span>
                </label>
              </div>



              {/* Price Preview */}
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-primary-700 font-semibold">
                  <FiInfo /> Order Summary
                </div>
                {orderPreview ? (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Price per kg</span>
                      <span>₹{orderPreview.base + orderPreview.margin}/kg</span>
                    </div>
                    {orderForm.logistics === 'partner' && (
                      <div className="flex justify-between text-blue-600">
                        <span>Delivery Fee</span>
                        <span>₹{orderPreview.delivery}/kg</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2 mt-2">
                      <span>Total Amount</span>
                      <span>₹{orderPreview.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">Select crop and quantity to view price</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={!orderPreview} className="btn-primary flex-1 flex justify-center gap-2 active:scale-95">
                  <FiCheckCircle /> Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BuyerDashboard;
