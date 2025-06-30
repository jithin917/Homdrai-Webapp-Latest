import React from 'react';
import { Award, Heart, Users, Sparkles } from 'lucide-react';

export const About = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
              About Homdrai
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Where passion meets precision, and every stitch tells a story of craftsmanship and care.
            </p>
          </div>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Homdrai was born from a simple yet powerful belief: every woman deserves to feel confident and beautiful in clothes that are made just for her. Our journey began with a passion for traditional craftsmanship and an eye for contemporary design.
                </p>
                <p>
                  What started as a small atelier has grown into a trusted name in custom tailoring, serving women who appreciate the art of bespoke fashion. We understand that clothing is not just about covering the body—it's about expressing your personality, celebrating your uniqueness, and making you feel empowered.
                </p>
                <p>
                  Every garment that leaves our studio is a testament to our commitment to excellence. From the initial consultation to the final fitting, we pour our heart and expertise into creating pieces that are not just beautiful, but truly yours.
                </p>
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Homdrai atelier"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Passion</h3>
              <p className="text-gray-600">
                We pour our heart into every creation, treating each garment as a work of art that reflects our love for the craft.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We never compromise on quality, using only the finest materials and employing the highest standards of craftsmanship.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalization</h3>
              <p className="text-gray-600">
                Every client is unique, and we celebrate that by creating garments that are tailored not just to your body, but to your spirit.
              </p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                While we honor traditional techniques, we embrace modern technology and design trends to create timeless yet contemporary pieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4050302/pexels-photo-4050302.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Quality craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="animate-slide-up">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-6">
                Our Commitment to You
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  When you choose Homdrai, you're not just getting a garment—you're investing in a relationship built on trust, creativity, and mutual respect. We understand that your clothes are an extension of your personality, and we take that responsibility seriously.
                </p>
                <p>
                  Our team of skilled artisans brings decades of combined experience to every project. We stay updated with the latest fashion trends while respecting the timeless techniques that have been passed down through generations.
                </p>
                <p>
                  From the moment you walk into our studio to the day you wear your custom creation, we're with you every step of the way. Your satisfaction is our success, and your confidence in our creation is our greatest reward.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => {
                      const phoneNumber = '+919567199924';
                      const message = encodeURIComponent("Hi Homdrai, I'd like to know more about your services and schedule a consultation.");
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Start Your Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-slide-up">
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Garments Created</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">5+</div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;