import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-display font-bold">Homdrai</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Crafting bespoke fashion with precision and passion. Where your style meets our expertise to create something uniquely yours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Services</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Contact</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services/designer-blouses" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Blouse Stitching</Link></li>
              <li><Link to="/services/lehenga-stitching" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Lehenga Stitching</Link></li>
              <li><Link to="/services/pre-pleated-sarees" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Pre-pleated Saree</Link></li>
              <li><Link to="/services/alterations" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">Alterations</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Kochi, Kerala, India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a href="tel:+919567199924" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">+91 95671 99924</a>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">homdrai.com</span>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors text-sm underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Buceros Enterprises Pvt Ltd. All Rights Reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};