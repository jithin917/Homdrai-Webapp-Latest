import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Bridal Wear', path: '/services/bridal-wear' },
    { name: 'Designer Blouses', path: '/services/designer-blouses' },
    { name: 'Lehenga Stitching', path: '/services/lehenga-stitching' },
    { name: 'Designer Gowns', path: '/services/designer-gowns' },
    { name: 'Anarkali Suits', path: '/services/anarkali-suits' },
    { name: 'Pre-pleated Sarees', path: '/services/pre-pleated-sarees' },
    { name: 'Alterations', path: '/services/alterations' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/services') {
      return (
        location.pathname === '/services' ||
        location.pathname.startsWith('/services/')
      );
    }
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-display font-bold text-gray-900">
              Homdrai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActivePath('/')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className={`flex items-center font-medium transition-colors ${
                  isActivePath('/services')
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Services
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 animate-fade-in">
                  <Link
                    to="/services"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    All Services
                  </Link>
                  <div className="border-t my-2"></div>
                  {services.map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/dress-designer"
              className={`font-medium transition-colors ${
                isActivePath('/dress-designer')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              AI Designer
            </Link>

            <Link
              to="/ai-stylist"
              className={`font-medium transition-colors ${
                isActivePath('/ai-stylist')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              <span>AI Stylist</span>
            </Link>

            <Link
              to="/about"
              className={`font-medium transition-colors ${
                isActivePath('/about')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors ${
                isActivePath('/contact')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/partnerships"
              className={`font-medium transition-colors ${
                isActivePath('/partnerships')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              B2B Partnerships
            </Link>
            <Link
              to="/admin"
              className={`font-medium transition-colors text-gray-500 hover:text-primary-600 text-sm`}
            >
              Admin
            </Link>
            <Link
              to="/partner/login"
              className={`font-medium transition-colors text-gray-500 hover:text-primary-600 text-sm`}
            >
              Partner
            </Link>
            <Link
              to="/oms/login"
              className={`font-medium transition-colors text-gray-500 hover:text-primary-600 text-sm`}
            >
              OMS
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-white animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/services"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/services')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>

              <Link
                to="/dress-designer"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/dress-designer')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                AI Designer
              </Link>

              <Link
                to="/ai-stylist"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/ai-stylist')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                AI Stylist
              </Link>

              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/about')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>

              <Link
                to="/contact"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/contact')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <Link
                to="/partnerships"
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActivePath('/partnerships')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                B2B Partnerships
              </Link>

              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md font-medium transition-colors text-gray-500 hover:text-primary-600 hover:bg-gray-50 text-sm`}
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>

              <Link
                to="/partner/login"
                className={`block px-3 py-2 rounded-md font-medium transition-colors text-gray-500 hover:text-primary-600 hover:bg-gray-50 text-sm`}
                onClick={() => setIsOpen(false)}
              >
                Partner Login
              </Link>

              <Link
                to="/oms/login"
                className={`block px-3 py-2 rounded-md font-medium transition-colors text-gray-500 hover:text-primary-600 hover:bg-gray-50 text-sm`}
                onClick={() => setIsOpen(false)}
              >
                OMS Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};