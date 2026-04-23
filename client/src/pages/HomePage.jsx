import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCenters } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FiArrowRight, FiMapPin, FiTruck, FiDollarSign, FiAward,
  FiExternalLink, FiNavigation, FiCheckCircle, FiUsers, FiPackage
} from 'react-icons/fi';
import { GiWheat, GiFarmer, GiCorn } from 'react-icons/gi';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const schemes = [
  {
    title: 'PM-KISAN',
    desc: 'Direct income support of ₹6,000/year to eligible farmer families in three equal installments.',
    link: 'https://pmkisan.gov.in/',
    color: 'from-green-400 to-emerald-500',
  },
  {
    title: 'e-NAM',
    desc: 'National Agriculture Market platform for transparent online trading of agricultural commodities.',
    link: 'https://enam.gov.in/',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    title: 'Soil Health Card',
    desc: 'Provides soil nutrient status and recommendation on dosage of fertilizers for better crop yields.',
    link: 'https://soilhealth.dac.gov.in/',
    color: 'from-amber-400 to-orange-500',
  },
  {
    title: 'PMFBY',
    desc: 'Pradhan Mantri Fasal Bima Yojana provides crop insurance against natural calamities and disasters.',
    link: 'https://pmfby.gov.in/',
    color: 'from-red-400 to-rose-500',
  },
  {
    title: 'Kisan Credit Card',
    desc: 'Timely access to short-term credit for farming activities at affordable interest rates.',
    link: 'https://www.pmkisan.gov.in/kcc',
    color: 'from-purple-400 to-violet-500',
  },
  {
    title: 'PM-KUSUM',
    desc: 'Encourages solar energy in agriculture with subsidies for solar pumps and power plants.',
    link: 'https://mnre.gov.in/pmkusum',
    color: 'from-yellow-400 to-amber-500',
  },
];

const LocateControl = () => {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 12 });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-xl shadow-lg hover:shadow-xl
                 hover:bg-primary-50 transition-all duration-200 group"
      title="Find my location"
    >
      <FiNavigation className="text-primary-600 group-hover:text-primary-700" size={18} />
    </button>
  );
};

const HomePage = () => {
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data } = await getCenters();
        setCenters(data.centers || []);
      } catch (err) {
        console.log('Centers will show after backend is running');
      }
    };
    fetchCenters();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 pb-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-emerald-800 to-green-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-16 h-16 bg-primary-400/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl animate-float stagger-2" />
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-yellow-400/15 rounded-full blur-xl animate-float stagger-4" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <GiWheat className="text-yellow-300" />
              <span className="text-primary-100 text-sm font-medium">India's Agricultural Supply Chain Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Empowering Farmers.
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Connecting Markets.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              AgriLink bridges the gap between farmers and buyers through a network of modern collection centers, fair pricing, and transparent credit facilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="bg-white text-primary-700 font-bold py-3.5 px-8 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 flex items-center gap-2 text-lg">
                Get Started <FiArrowRight />
              </Link>
              <Link to="/login" className="border-2 border-white/30 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-lg">
                Login
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto relative z-20">
              {[
                { num: '500+', label: 'Farmers' },
                { num: '25+', label: 'Centers' },
                { num: '₹10L+', label: 'Credit Given' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{num}</p>
                  <p className="text-primary-200 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#f8faf9" />
          </svg>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-20 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6 tracking-tight">
                Revolutionizing the Agri
                <span className="gradient-text"> Supply Chain</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                AgriLink operates a network of collection centers across India where farmers can bring their produce for fair grading, weighing, and pricing. We eliminate middlemen and connect farmers directly to markets.
              </p>
              <div className="space-y-4">
                {[
                  { icon: FiCheckCircle, text: 'Fair and transparent pricing for all produce' },
                  { icon: FiCheckCircle, text: 'Credit facilities with easy repayment options' },
                  { icon: FiCheckCircle, text: 'Quality grading to ensure best market rates' },
                  { icon: FiCheckCircle, text: 'Direct market access without middlemen' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon className="text-primary-500 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-emerald-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/50 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/50 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative grid grid-cols-2 gap-4">
                  {[
                    { icon: GiFarmer, label: 'Farmers Served', value: '500+', bg: 'bg-white' },
                    { icon: FiMapPin, label: 'Collection Centers', value: '25+', bg: 'bg-white' },
                    { icon: FiPackage, label: 'Tons Collected', value: '1200+', bg: 'bg-white' },
                    { icon: FiDollarSign, label: 'Credit Disbursed', value: '₹10L+', bg: 'bg-white' },
                  ].map(({ icon: Icon, label, value, bg }) => (
                    <div key={label} className={`${bg} rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow`}>
                      <Icon className="mx-auto text-primary-600 mb-2" size={28} />
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GOVERNMENT SCHEMES ===== */}
      <section id="schemes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Resources</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
              Government <span className="gradient-text">Schemes & Initiatives</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Explore schemes designed to support Indian farmers with financial aid, insurance, and market access.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme, i) => (
              <a
                key={scheme.title}
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group glass-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 stagger-${i + 1} animate-fade-in`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${scheme.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <FiAward className="text-white" size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {scheme.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{scheme.desc}</p>
                <span className="inline-flex items-center gap-1 text-primary-600 text-sm font-semibold group-hover:gap-2 transition-all">
                  Learn More <FiExternalLink size={14} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section id="map" className="py-20 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Locate</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
              Find Nearest <span className="gradient-text">Collection Center</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Use the map to find our collection centers near you. Click the location button to use GPS.
            </p>
          </div>

          <div className="glass-card p-3 relative" style={{ height: '500px' }}>
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              scrollWheelZoom={true}
              className="w-full h-full rounded-xl z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocateControl />
              {centers.map((center) => (
                <Marker
                  key={center._id}
                  position={[center.location.lat, center.location.lng]}
                  icon={greenIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="text-primary-700">{center.name}</strong><br />
                      <span className="text-gray-500 text-xs">{center.address}</span><br />
                      {center.managerId && (
                        <span className="text-xs text-gray-400">Manager: {center.managerId.name}</span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
              How <span className="gradient-text">It Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            {[
              {
                step: '01',
                icon: GiFarmer,
                title: 'Farmers Bring Produce',
                desc: 'Farmers bring their crop to the nearest AgriLink collection center for weighing and quality assessment.',
                color: 'from-green-400 to-emerald-500',
              },
              {
                step: '02',
                icon: FiPackage,
                title: 'We Aggregate & Grade',
                desc: 'Our team grades the produce based on quality parameters and aggregates for bulk market dispatch.',
                color: 'from-blue-400 to-indigo-500',
              },
              {
                step: '03',
                icon: FiTruck,
                title: 'Sell to Buyers',
                desc: 'Aggregated produce is sold to verified buyers at competitive market rates ensuring fair farmer income.',
                color: 'from-amber-400 to-orange-500',
              },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <div key={step} className={`relative text-center stagger-${i + 1} animate-slide-up`}>
                <div className="relative z-10 mx-auto mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-xs">{step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-emerald-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">
            Ready to Join the Agricultural Revolution?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Whether you're a farmer looking for fair prices or an admin managing collection centers, AgriLink has you covered.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 font-bold py-3.5 px-8 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:shadow-xl flex items-center gap-2 text-lg">
              <GiFarmer /> Login as Farmer
            </Link>
            <Link to="/login" className="border-2 border-white/30 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-lg">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
