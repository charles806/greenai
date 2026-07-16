import { Link } from 'react-router-dom';
import { Leaf, X } from 'lucide-react';

export interface AuthModalConfig {
  title: string;
  description: string;
}

interface AuthModalProps {
  isOpen: boolean;
  config: AuthModalConfig | null;
  onClose: () => void;
}

export function AuthModal({ isOpen, config, onClose }: AuthModalProps) {
  if (!isOpen || !config) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
            >
              <Leaf className="w-7 h-7 text-emerald-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{config.description}</p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-center transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="block w-full py-2.5 px-4 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-200 hover:text-white font-medium text-center transition"
            >
              Create account
            </Link>
            <button
              onClick={onClose}
              className="block w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
