import { GiWheat } from 'react-icons/gi';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <GiWheat className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-white">
                Agri<span className="text-primary-400">Link</span>
              </span>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              Empowering farmers by connecting them to markets through our network of collection centers. We provide fair pricing, credit facilities, and transparent transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/#about" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="/#schemes" className="hover:text-primary-400 transition-colors">Govt. Schemes</a></li>
              <li><a href="/#map" className="hover:text-primary-400 transition-colors">Find Centers</a></li>
              <li><a href="/#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><FiMail size={14} className="text-primary-400" /> info@agrilink.com</li>
              <li className="flex items-center gap-2"><FiPhone size={14} className="text-primary-400" /> +91 98765 43210</li>
              <li className="flex items-start gap-2"><FiMapPin size={14} className="text-primary-400 mt-1" /> Krishi Bhavan, New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AgriLink. All rights reserved. Built for a better agricultural future.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
