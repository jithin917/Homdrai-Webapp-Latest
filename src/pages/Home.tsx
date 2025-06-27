import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, Sparkles, ShoppingBag, Clock, CheckCircle, Building2, Handshake, Search, MessageSquare } from 'lucide-react';

const Home = () => {
  const handleBookConsultation = () => {
    const phoneNumber = '+919567199924';
    const message = encodeURIComponent("Hi Homdrai, I'm interested in your custom tailoring services and would like to book a consultation.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const services = [
    {
      name: 'Bridal Wear',
      image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Exquisite bridal outfits crafted for your special day',
      link: '/services/bridal-wear'
    },
    {
      name: 'Designer Blouses',
      image: 'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Custom blouses with intricate designs and perfect fit',
      link: '/services/designer-blouses'
    },
    {
      name: 'Lehenga Stitching',
      image: 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Traditional lehengas with contemporary flair',
      link: '/services/lehenga-stitching'
    },
    {
      name: 'Designer Gowns',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Elegant gowns for every special occasion',
      link: '/services/designer-gowns'
    }
  ];

  const packages = [
    {
      name: 'Blouse Package',
      price: 'Starting from ₹650',
      features: ['Custom measurements', 'Design consultation', 'Premium fabrics', '7-day delivery']
    },
    {
      name: 'Churidar Package',
      price: 'Starting from ₹1,200',
      features: ['Complete set', 'Matching dupatta', 'Custom fitting', '10-day delivery']
    },
    {
      name: 'Lehenga Package',
      price: 'Starting from ₹2,500',
      features: ['3-piece set', 'Heavy work options', 'Trial fittings', '15-day delivery']
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 mb-6">
                Women's Style,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Elevated
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 font-light">
                Couture Crafted, Uniquely Yours
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Experience the art of bespoke tailoring where every stitch tells your story. From bridal wear to everyday elegance, we create garments that celebrate your individuality.
              </p>
              <button
                onClick={handleBookConsultation}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative animate-fade-in">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Custom tailoring showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-secondary-500 text-white p-4 rounded-full shadow-lg animate-bounce-gentle">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* AI Stylist Feature */}
          <div className="mb-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>New Feature</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-6">
                  Meet Your AI Personal Stylist
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Experience the future of fashion design with our conversational AI stylist. 
                  Describe your dream outfit in natural language, and watch as our AI brings your vision to life.
                  Save your designs, share with friends, and order directly from the app.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Chat naturally about your style preferences</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">AI-powered design recommendations</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ShoppingBag className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Seamless ordering from your saved designs</p>
                  </div>
                </div>
                <Link
                  to="/ai-stylist"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <span>Try AI Stylist Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10"></div>
                <img
                  src="https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="AI Stylist"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Signature Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From traditional elegance to contemporary style, we bring your fashion dreams to life with meticulous attention to detail.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.name} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square rounded-t-2xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link
                    to={service.link}
                    className="text-primary-600 font-medium flex items-center space-x-2 hover:text-primary-700 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Track Your Order
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with your order status and delivery timeline
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Track Your Order Status
              </h3>
              <p className="text-gray-600 mb-8">
                Enter your order number and phone number to get real-time updates on your garment's progress
              </p>
              <Link
                to="/oms/tracking"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Track Your Order</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Partnership Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Business Partnerships
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scale your business with our comprehensive B2B solutions and partnership opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Bulk Orders Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Bulk Orders & Export</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Partner with us for large-scale manufacturing, corporate orders, and export requirements. We provide competitive pricing and consistent quality for bulk orders.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Minimum order: 100+ pieces</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Export quality standards</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Competitive bulk pricing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Timely delivery schedules</span>
                </li>
              </ul>
              <Link
                to="/partnerships?tab=bulk-orders"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Submit Bulk Order Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Partnership Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-4">
                  <Handshake className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Stitching Unit Partnership</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join our network of trusted stitching units. Get consistent orders, technical support, and grow your business with our established brand.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Regular order flow</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Technical training support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Quality standards guidance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Timely payments</span>
                </li>
              </ul>
              <Link
                to="/partnerships?tab=stitching-partnership"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Apply for Partnership</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Why Choose Homdrai?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the difference of true craftsmanship and personalized service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Design</h3>
              <p className="text-gray-600">
                Every piece is designed specifically for you, reflecting your unique style and preferences with careful attention to your body type and comfort.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Tailoring</h3>
              <p className="text-gray-600">
                Our skilled artisans bring years of experience and traditional techniques combined with modern precision to create flawless garments.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">High-Quality Materials</h3>
              <p className="text-gray-600">
                We source only the finest fabrics and materials, ensuring your garments not only look beautiful but also stand the test of time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to your perfect custom outfit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <div className="mb-6">
                <Users className="w-12 h-12 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Stylist</h3>
              <p className="text-gray-600">
                Connect with our expert stylists who will understand your vision and guide you through the design process.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <div className="mb-6">
                <Sparkles className="w-12 h-12 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Custom Outfit</h3>
              <p className="text-gray-600">
                Work together to design every detail, from fabric selection to intricate embellishments, ensuring it's uniquely yours.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <div className="mb-6">
                <ShoppingBag className="w-12 h-12 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pay and Order</h3>
              <p className="text-gray-600">
                Secure your order with flexible payment options and track the progress of your custom creation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Popular Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully curated packages or customize your own
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div 
                key={pkg.name} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-primary-600 mb-6">{pkg.price}</p>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleBookConsultation}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Let's bring your fashion vision to life. Book a consultation today and start your journey to the perfect custom outfit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBookConsultation}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;