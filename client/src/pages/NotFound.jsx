import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-emerald-800 to-green-900 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <GiWheat className="mx-auto text-yellow-300 mb-6" size={64} />
        <h1 className="text-8xl font-extrabold text-white mb-4">404</h1>
        <p className="text-xl text-primary-100 mb-8">Oops! This field hasn't been planted yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-6 rounded-xl hover:bg-primary-50 transition-all">
          <FiHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
