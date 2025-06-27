import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Star, Users } from 'lucide-react';

const ServiceDetail = () => {
  const { serviceName } = useParams();

  const serviceData: Record<string, any> = {
    'bridal-wear': {
      name: 'Bridal Wear',
      price: 'Starting from ₹5,000',
      images: [
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Your wedding day deserves nothing less than perfection. Our bridal wear collection combines traditional craftsmanship with contemporary design to create stunning outfits that make your special day unforgettable. From classic red lehengas to modern fusion wear, we create bespoke bridal ensembles that reflect your personality and style.',
      features: [
        'Custom embroidery and beadwork',
        'Premium silk and designer fabrics',
        'Multiple fitting sessions',
        'Complete bridal consultation',
        'Matching accessories coordination',
        'Color customization options',
        'Traditional and contemporary styles',
        'Professional finishing touches'
      ],
      deliveryTime: '3-4 weeks',
      includes: ['Bridal outfit', 'Matching dupatta/veil', 'Blouse/choli', 'Fitting sessions', 'Style consultation']
    },
    'designer-blouses': {
      name: 'Designer Blouses',
      price: 'Starting from ₹650',
      images: [
        'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3692750/pexels-photo-3692750.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Transform your sarees with our exquisitely crafted designer blouses. From intricate embroidery to contemporary cuts, our blouses are designed to complement your style and enhance your elegance. Each piece is tailored to perfection with attention to detail and comfort.',
      features: [
        'Precise custom measurements',
        'Various neckline options',
        'Sleeve length variations',
        'Embroidery and embellishment work',
        'Color matching services',
        'Quick turnaround time',
        'Multiple design consultations',
        'Premium closure options'
      ],
      deliveryTime: '7 days',
      includes: ['Custom blouse', 'Design consultation', 'Fitting session', 'Color matching', 'Style variations']
    },
    'lehenga-stitching': {
      name: 'Lehenga Stitching',
      price: 'Starting from ₹2,500',
      images: [
        'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Celebrate tradition with our stunning lehenga collection. Whether it\'s for a wedding, festival, or special celebration, our lehengas combine timeless elegance with contemporary flair. Each piece is crafted with premium fabrics and intricate detailing.',
      features: [
        'Complete 3-piece set',
        'Custom embellishments and work',
        'Color coordination services',
        'Size adjustments included',
        'Traditional and modern styles',
        'Premium fabric options',
        'Detailed handwork available',
        'Perfect fit guarantee'
      ],
      deliveryTime: '15 days',
      includes: ['Lehenga skirt', 'Matching choli/blouse', 'Dupatta', 'Custom embellishments', 'Fitting sessions']
    },
    'designer-gowns': {
      name: 'Designer Gowns',
      price: 'Starting from ₹3,500',
      images: [
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1447333/pexels-photo-1447333.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Make a statement with our elegant designer gowns. Perfect for cocktail parties, formal events, or special occasions, our gowns are crafted to make you feel confident and beautiful. From flowing evening gowns to chic cocktail dresses.',
      features: [
        'Evening and cocktail styles',
        'Custom length adjustments',
        'Premium finishing techniques',
        'Designer silhouettes',
        'Fabric variety options',
        'Custom embellishments',
        'Perfect fit guarantee',
        'Professional consultation'
      ],
      deliveryTime: '12 days',
      includes: ['Custom gown', 'Style consultation', 'Multiple fittings', 'Length adjustments', 'Premium finish']
    },
    'anarkali-suits': {
      name: 'Anarkali Suits',
      price: 'Starting from ₹2,200',
      images: [
        'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Grace and elegance come together in our beautiful Anarkali suits. These flowing silhouettes blend traditional charm with contemporary style, perfect for festive occasions, parties, and cultural celebrations.',
      features: [
        'Flowing elegant silhouettes',
        'Intricate embroidered patterns',
        'Matching dupatta included',
        'Comfortable and stylish fit',
        'Various length options',
        'Custom color combinations',
        'Traditional and modern designs',
        'Premium fabric choices'
      ],
      deliveryTime: '10 days',
      includes: ['Anarkali kurta', 'Matching churidar/pants', 'Coordinated dupatta', 'Custom embroidery', 'Style consultation']
    },
    'pre-pleated-sarees': {
      name: 'Pre-pleated Sarees',
      price: 'Starting from ₹1,800',
      images: [
        'https://images.pexels.com/photos/3692750/pexels-photo-3692750.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Experience the convenience of ready-to-wear sarees with perfect pleats. Our pre-pleated sarees combine traditional elegance with modern convenience, allowing you to look stunning with minimal effort.',
      features: [
        'Pre-set perfect pleats',
        'Easy draping system',
        'Custom blouse included',
        'Various draping styles available',
        'Time-saving solution',
        'Professional finish',
        'Comfort and style combined',
        'Maintenance instructions provided'
      ],
      deliveryTime: '8 days',
      includes: ['Pre-pleated saree', 'Custom fitted blouse', 'Draping guide', 'Care instructions', 'Style consultation']
    },
    'alterations': {
      name: 'Alterations',
      price: 'Starting from ₹200',
      images: [
        'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4050302/pexels-photo-4050302.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Give your existing garments a new lease of life with our professional alteration services. From simple hemming to complex resizing, we ensure your clothes fit perfectly and look their best.',
      features: [
        'Size adjustments (taking in/out)',
        'Length modifications (hemming)',
        'Style updates and modernization',
        'Zipper and closure repairs',
        'Fabric matching for repairs',
        'Quick turnaround time',
        'Quality workmanship',
        'Affordable pricing'
      ],
      deliveryTime: '3-5 days',
      includes: ['Professional alteration', 'Fitting session', 'Quality check', 'Care instructions', 'Satisfaction guarantee']
    }
  };

  const service = serviceData[serviceName || ''];

  if (!service) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600">The service you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    const phoneNumber = '+919567199924';
    const message = encodeURIComponent(`Hi Homdrai, I'm interested in your ${service.name} service and would like to book a consultation.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
              {service.name}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-5 h-5" />
                <span>{service.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>4.9 (150+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {service.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md">
                    <img
                      src={image}
                      alt={`${service.name} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-primary-600">{service.price}</h2>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {service.description}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                <ul className="space-y-2">
                  {service.includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const phoneNumber = '+919567199924';
                    const message = encodeURIComponent(`Hi Homdrai, I have some questions about your ${service.name} service.`);
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full border-2 border-primary-600 text-primary-600 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  Inquire for this Service
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Delivery: {service.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>150+ Happy Customers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;