import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Services = () => {
  const services = [
    {
      name: 'Bridal Wear',
      slug: 'bridal-wear',
      image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Exquisite bridal outfits for your most special day. From traditional to contemporary styles, we create unforgettable bridal wear.',
      price: 'Starting from ₹5,000',
      features: ['Custom embroidery', 'Premium fabrics', 'Multiple fittings', 'Bridal consultation']
    },
    {
      name: 'Designer Blouses',
      slug: 'designer-blouses',
      image: 'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Custom blouses with intricate designs and perfect fit. From classic to contemporary patterns.',
      price: 'Starting from ₹650',
      features: ['Custom measurements', 'Design variations', 'Quick delivery', 'Pattern options']
    },
    {
      name: 'Lehenga Stitching',
      slug: 'lehenga-stitching',
      image: 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Traditional lehengas with contemporary flair. Perfect for weddings, festivals, and special occasions.',
      price: 'Starting from ₹2,500',
      features: ['3-piece set', 'Custom embellishments', 'Color matching', 'Size adjustments']
    },
    {
      name: 'Designer Gowns',
      slug: 'designer-gowns',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Elegant gowns for every special occasion. From cocktail parties to formal events.',
      price: 'Starting from ₹3,500',
      features: ['Evening wear', 'Cocktail styles', 'Custom length', 'Premium finish']
    },
    {
      name: 'Anarkali Suits',
      slug: 'anarkali-suits',
      image: 'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Graceful Anarkali suits that blend tradition with modern elegance.',
      price: 'Starting from ₹2,200',
      features: ['Flowing silhouettes', 'Embroidered patterns', 'Matching dupatta', 'Comfortable fit']
    },
    {
      name: 'Pre-pleated Sarees',
      slug: 'pre-pleated-sarees',
      image: 'https://images.pexels.com/photos/3692750/pexels-photo-3692750.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Ready-to-wear sarees with perfect pleats. Convenience meets elegance.',
      price: 'Starting from ₹1,800',
      features: ['Pre-set pleats', 'Easy draping', 'Custom blouse', 'Various styles']
    },
    {
      name: 'Alterations',
      slug: 'alterations',
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: 'Professional alterations to make your existing garments fit perfectly.',
      price: 'Starting from ₹200',
      features: ['Size adjustments', 'Hemming', 'Taking in/out', 'Style updates']
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of custom tailoring services, each crafted with precision and attention to detail.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.slug} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square rounded-t-2xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-primary-600 mb-2">{service.price}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    to={`/services/${service.slug}`}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We specialize in creating custom garments. Let us know your requirements and we'll make it happen.
          </p>
          <button
            onClick={() => {
              const phoneNumber = '+919567199924';
              const message = encodeURIComponent("Hi Homdrai, I have a custom tailoring requirement I'd like to discuss.");
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;