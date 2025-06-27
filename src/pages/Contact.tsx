import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '+919567199924';
    const message = encodeURIComponent("Hi Homdrai, I'd like to get in touch with you regarding your services.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to create something beautiful together? Get in touch with us today.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  We'd love to hear from you. Whether you have a question about our services, need a consultation, or want to start your custom tailoring journey, we're here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Visit Our Studio</h3>
                    <p className="text-gray-600">
                      Kochi, Kerala, India<br />
                      (Exact address provided upon consultation booking)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Call Us</h3>
                    <a 
                      href="tel:+919567199924" 
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      +91 95671 99924
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <button
                      onClick={handleWhatsAppClick}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      Chat with us instantly
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                      <p>Sunday: 10:00 AM - 5:00 PM</p>
                      <p className="text-sm text-primary-600 font-medium">
                        Appointments recommended
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleWhatsAppClick}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Book Consultation</span>
                  </button>
                  <a
                    href="tel:+919567199924"
                    className="border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Now</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Find Us</h3>
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Location details provided upon<br />
                      consultation booking
                    </p>
                    <button
                      onClick={handleWhatsAppClick}
                      className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Why Visit Our Studio?</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    <span>Experience our fabric collection in person</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    <span>Get precise measurements taken by experts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    <span>Discuss your vision with our designers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                    <span>See our previous work and portfolio</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I book a consultation?
              </h3>
              <p className="text-gray-600">
                You can book a consultation by calling us, messaging us on WhatsApp, or clicking any "Book Consultation" button on our website. We'll schedule a convenient time for you to visit our studio.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What should I bring to my consultation?
              </h3>
              <p className="text-gray-600">
                Bring any reference images, existing garments for fit reference, and ideas about what you'd like. We'll handle everything else including measurements and design discussions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does it take to complete an order?
              </h3>
              <p className="text-gray-600">
                Delivery times vary by service: blouses (7 days), alterations (3-5 days), lehengas (15 days), and bridal wear (3-4 weeks). We'll provide exact timelines during consultation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer home visits?
              </h3>
              <p className="text-gray-600">
                We offer home visits for consultations and fittings in select areas around Kochi. Contact us to check if your location is covered and discuss arrangements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;