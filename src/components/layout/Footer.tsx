import React from 'react';
import { Mic, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Scenarios', href: '#scenarios' },
      { label: 'Expert Library', href: '#experts' },
      { label: 'Mobile App', href: '#mobile' },
    ],
    resources: [
      { label: 'Documentation', href: '#docs' },
      { label: 'Tutorials', href: '#tutorials' },
      { label: 'Blog', href: '#blog' },
      { label: 'Webinars', href: '#webinars' },
      { label: 'Case Studies', href: '#cases' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Partners', href: '#partners' },
      { label: 'Press', href: '#press' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'HIPAA Compliance', href: '#hipaa' },
      { label: 'Accessibility', href: '#accessibility' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#facebook', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#twitter', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#linkedin', label: 'LinkedIn' },
    { icon: <Instagram className="w-5 h-5" />, href: '#instagram', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, href: '#youtube', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#1A1A2E] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2C5F8D] to-[#4A90C2] flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">VoiceCoach</span>
                <span className="text-[#4CAF50] font-bold">Pro</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">
              Empowering medical interpreters with AI-powered voice training to deliver 
              clearer, more compassionate communication when it matters most.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@voicecoachpro.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@voicecoachpro.com
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                1-800-123-4567
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-12 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest tips, scenarios, and training resources.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2C5F8D]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#2C5F8D] text-white font-semibold rounded-xl hover:bg-[#234B73] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} VoiceCoach Pro. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-800 rounded">HIPAA Compliant</span>
              <span className="px-2 py-1 bg-gray-800 rounded">SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
