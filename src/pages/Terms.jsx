import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => (
  <div className="min-h-screen bg-sl-gradient flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-2xl">
      <Link to="/register" className="inline-flex items-center gap-2 text-sl-purple-light hover:text-sl-purple/70 transition mb-6 text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Registration
      </Link>
      <div className="mobile-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold gradient-text mb-6">Terms of Service</h1>
        <div className="space-y-4 text-sm text-sl-gray-light/80 leading-relaxed">
          <p><strong className="text-white">1. Acceptance of Terms</strong><br />By accessing and using Genesis Rise, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          <p><strong className="text-white">2. User Account</strong><br />You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          <p><strong className="text-white">3. Acceptable Use</strong><br />You agree not to misuse the service, interfere with its operation, or engage in any unlawful activity through the platform.</p>
          <p><strong className="text-white">4. Data Privacy</strong><br />Your data is handled in accordance with our Privacy Policy. We do not share your personal information without your consent.</p>
          <p><strong className="text-white">5. Limitation of Liability</strong><br />Genesis Rise is provided "as is" without warranties of any kind. We are not liable for damages arising from your use of the service.</p>
          <p><strong className="text-white">6. Changes</strong><br />We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.</p>
          <p className="text-sl-purple-light/50 text-xs pt-4">Last updated: June 2026</p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;
