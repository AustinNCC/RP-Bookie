import { Link } from 'react-router-dom';
import { Lock as Shamrock, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Shamrock className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse-glow" />
        <h1 className="text-4xl font-extrabold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          Looks like the page you're trying to access doesn't exist.
        </p>
        <Link 
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home size={18} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;