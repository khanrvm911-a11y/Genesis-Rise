import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => (
  <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-2xl">
      <Link to="/register" className="inline-flex items-center gap-2 text-sl-purple-light hover:text-sl-purple/70 transition mb-6 text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Registration
      </Link>
      <div className="mobile-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold gradient-text mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-sl-gray-light/80 leading-relaxed">
          <p><strong className="text-white">1. Information We Collect</strong><br />We collect information you provide during registration (email, username) and data you generate while using the app (workout logs, health metrics, goals).</p>
          <p><strong className="text-white">2. How We Use Your Data</strong><br />Your data is used solely to provide and improve the Genesis Rise experience, including progress tracking, analytics, and personalized recommendations.</p>
          <p><strong className="text-white">3. Data Storage & Security</strong><br />Data is stored securely using industry-standard encryption. We implement measures to protect against unauthorized access or disclosure.</p>
          <p><strong className="text-white">4. Third-Party Services</strong><br />We use Supabase for database and authentication services. These providers are contractually bound to protect your data.</p>
          <p><strong className="text-white">5. Your Rights</strong><br />You may request access to, modification of, or deletion of your data at any time by contacting us.</p>
          <p><strong className="text-white">6. Cookies</strong><br />We use essential cookies for authentication purposes only. No tracking cookies are used.</p>
          <p className="text-sl-purple-light/50 text-xs pt-4">Last updated: June 2026</p>
        </div>
      </div>
    </div>
  </div>
);

export default Privacy;
