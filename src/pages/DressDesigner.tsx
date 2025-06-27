import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Shirt, Heart, Share2, Download, RefreshCw, Camera, Star, Users, Clock, Zap } from 'lucide-react';

interface DesignConfig {
  basicDetails: {
    articleNumber: string;
    skuNumber: string;
    focusKeyPhrase: string;
    category: string;
  };
  styleSpecs: {
    dressStyle: string;
    length: string;
    fabric: string;
    color: string;
    neckline: string;
    sleeveStyle: string;
    backStyle: string;
  };
  embellishments: string[];
  sizeAndFit: {
    size: string;
    customMeasurements: any;
  };
  contextual: {
    occasion: string;
    season: string;
    priceRange: string;
  };
}

interface GeneratedDesign {
  id: string;
  config: DesignConfig;
  imageUrl: string;
  prompt: string;
  timestamp: Date;
  likes: number;
  views: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

const DressDesigner = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [designConfig, setDesignConfig] = useState<DesignConfig>({
    basicDetails: {
      articleNumber: '',
      skuNumber: '',
      focusKeyPhrase: '',
      category: 'traditional'
    },
    styleSpecs: {
      dressStyle: '',
      length: '',
      fabric: '',
      color: '',
      neckline: '',
      sleeveStyle: '',
      backStyle: ''
    },
    embellishments: [],
    sizeAndFit: {
      size: '',
      customMeasurements: {}
    },
    contextual: {
      occasion: '',
      season: '',
      priceRange: ''
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null);
  const [gallery, setGallery] = useState<GeneratedDesign[]>([]);
  const [activeTab, setActiveTab] = useState('designer');
  const [loadingMessage, setLoadingMessage] = useState('');

  // Ice breaker messages
  const iceBreakers = [
    "Welcome to Kerala's finest dress designer! ✨",
    "Let's create something beautiful together! What's the occasion?",
    "Ready to design your dream dress? Let's start!",
    "Feeling bold? Explore our fusion designs!",
    "New to traditional wear? We'll guide you!"
  ];

  const [currentIceBreaker, setCurrentIceBreaker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIceBreaker((prev) => (prev + 1) % iceBreakers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load gallery from localStorage
  useEffect(() => {
    const savedGallery = localStorage.getItem('dressDesignerGallery');
    if (savedGallery) {
      const parsedGallery = JSON.parse(savedGallery);
      // Convert timestamp strings back to Date objects
      const galleryWithDates = parsedGallery.map((design: any) => ({
        ...design,
        timestamp: new Date(design.timestamp)
      }));
      setGallery(galleryWithDates);
    } else {
      // Initialize with sample designs
      initializeSampleGallery();
    }
  }, []);

  const initializeSampleGallery = () => {
    const sampleDesigns: GeneratedDesign[] = [
      {
        id: '1',
        config: designConfig,
        imageUrl: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=400',
        prompt: 'Traditional Kerala saree with kasavu border',
        timestamp: new Date(),
        likes: 45,
        views: 120,
        status: 'completed'
      },
      {
        id: '2',
        config: designConfig,
        imageUrl: 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=400',
        prompt: 'Elegant lehenga with traditional embroidery',
        timestamp: new Date(),
        likes: 38,
        views: 95,
        status: 'completed'
      },
      {
        id: '3',
        config: designConfig,
        imageUrl: 'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=400',
        prompt: 'Modern fusion blouse with traditional motifs',
        timestamp: new Date(),
        likes: 52,
        views: 140,
        status: 'completed'
      }
    ];
    setGallery(sampleDesigns);
    localStorage.setItem('dressDesignerGallery', JSON.stringify(sampleDesigns));
  };

  const steps = [
    'Basic Details',
    'Style Selection',
    'Fabric & Colors',
    'Design Details',
    'Embellishments',
    'Size & Fit',
    'Occasion & Season',
    'Generate Design'
  ];

  const generateAIPrompt = (config: DesignConfig): string => {
    const { styleSpecs, embellishments, contextual } = config;
    
    let basePrompt = `Create a stunning ${styleSpecs.dressStyle || 'traditional'} dress design for a Kerala/Indian woman, featuring ${styleSpecs.fabric || 'silk'} fabric in ${styleSpecs.color || 'red'} color. The dress should have ${styleSpecs.length || 'ankle-length'} silhouette with ${styleSpecs.neckline || 'round'} neckline and ${styleSpecs.sleeveStyle || 'full'} sleeves.`;
    
    if (embellishments.length > 0) {
      basePrompt += ` Incorporate traditional ${embellishments.join(', ')} work typical of Kerala craftsmanship.`;
    }
    
    basePrompt += ` The design should be perfect for ${contextual.occasion || 'festival'} events and reflect the elegance of South Indian fashion heritage.`;
    
    // Add quality modifiers
    basePrompt += ' High-quality fashion photography, studio lighting, elegant Indian model, graceful pose, neutral background, focus on dress details, ultra-detailed fabric texture, realistic draping.';
    
    return basePrompt;
  };

  const simulateAIGeneration = async (config: DesignConfig) => {
    setIsGenerating(true);
    
    const loadingMessages = [
      "Preparing your design...",
      "Adding cultural touches...",
      "Crafting with AI magic...",
      "Almost ready! Adding final details...",
      "Your masterpiece is ready! ✨"
    ];
    
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingMessage(loadingMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Simulate API call to n8n webhook
    const prompt = generateAIPrompt(config);
    
    // For demo, use a sample image
    const sampleImages = [
      'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
    ];
    
    const newDesign: GeneratedDesign = {
      id: Date.now().toString(),
      config,
      imageUrl: sampleImages[Math.floor(Math.random() * sampleImages.length)],
      prompt,
      timestamp: new Date(),
      likes: 0,
      views: 1,
      status: 'completed'
    };
    
    setGeneratedDesign(newDesign);
    
    // Add to gallery
    const updatedGallery = [newDesign, ...gallery];
    setGallery(updatedGallery);
    localStorage.setItem('dressDesignerGallery', JSON.stringify(updatedGallery));
    
    setIsGenerating(false);
    setActiveTab('preview');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateAIDesign();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAIDesign = () => {
    simulateAIGeneration(designConfig);
  };

  const updateConfig = (section: keyof DesignConfig, field: string, value: any) => {
    setDesignConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleEmbellishment = (embellishment: string) => {
    setDesignConfig(prev => ({
      ...prev,
      embellishments: prev.embellishments.includes(embellishment)
        ? prev.embellishments.filter(e => e !== embellishment)
        : [...prev.embellishments, embellishment]
    }));
  };

  const likeDesign = (designId: string) => {
    const updatedGallery = gallery.map(design => 
      design.id === designId 
        ? { ...design, likes: design.likes + 1 }
        : design
    );
    setGallery(updatedGallery);
    localStorage.setItem('dressDesignerGallery', JSON.stringify(updatedGallery));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Details
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Number</label>
                <input
                  type="text"
                  value={designConfig.basicDetails.articleNumber}
                  onChange={(e) => updateConfig('basicDetails', 'articleNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., KD-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU Number</label>
                <input
                  type="text"
                  value={designConfig.basicDetails.skuNumber}
                  onChange={(e) => updateConfig('basicDetails', 'skuNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., SKU-KD-001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keywords</label>
                <input
                  type="text"
                  value={designConfig.basicDetails.focusKeyPhrase}
                  onChange={(e) => updateConfig('basicDetails', 'focusKeyPhrase', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Kerala traditional, festival wear, elegant"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['traditional', 'modern', 'fusion', 'bridal'].map((category) => (
                    <button
                      key={category}
                      onClick={() => updateConfig('basicDetails', 'category', category)}
                      className={`p-3 rounded-lg border-2 transition-all capitalize ${
                        designConfig.basicDetails.category === category
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Style Selection
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Style Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Dress Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Saree', 'Lehenga', 'Anarkali', 'Churidar', 'Gown', 'Blouse'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateConfig('styleSpecs', 'dressStyle', style)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        designConfig.styleSpecs.dressStyle === style
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Length</label>
                <div className="space-y-2">
                  {['Floor Length', 'Ankle Length', 'Midi Length', 'Knee Length', 'Short'].map((length) => (
                    <button
                      key={length}
                      onClick={() => updateConfig('styleSpecs', 'length', length)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        designConfig.styleSpecs.length === length
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Fabric & Colors
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Fabric & Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Fabric Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Velvet', 'Brocade', 'Handloom', 'Khadi'].map((fabric) => (
                    <button
                      key={fabric}
                      onClick={() => updateConfig('styleSpecs', 'fabric', fabric)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        designConfig.styleSpecs.fabric === fabric
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Palette</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Red', color: 'bg-red-500' },
                    { name: 'Gold', color: 'bg-yellow-500' },
                    { name: 'Green', color: 'bg-green-500' },
                    { name: 'Blue', color: 'bg-blue-500' },
                    { name: 'Purple', color: 'bg-purple-500' },
                    { name: 'Pink', color: 'bg-pink-500' },
                    { name: 'Orange', color: 'bg-orange-500' },
                    { name: 'Maroon', color: 'bg-red-800' },
                    { name: 'Navy', color: 'bg-blue-800' },
                    { name: 'Cream', color: 'bg-yellow-100' },
                    { name: 'White', color: 'bg-white border' },
                    { name: 'Black', color: 'bg-black' }
                  ].map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => updateConfig('styleSpecs', 'color', colorOption.name)}
                      className={`w-12 h-12 rounded-lg ${colorOption.color} border-2 transition-all ${
                        designConfig.styleSpecs.color === colorOption.name
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                      title={colorOption.name}
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    value={designConfig.styleSpecs.color}
                    onChange={(e) => updateConfig('styleSpecs', 'color', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Or enter custom color"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Design Details
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Design Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Neckline</label>
                <div className="space-y-2">
                  {['Round', 'V-Neck', 'Boat Neck', 'High Neck', 'Square', 'Sweetheart', 'Halter', 'Off-Shoulder'].map((neckline) => (
                    <button
                      key={neckline}
                      onClick={() => updateConfig('styleSpecs', 'neckline', neckline)}
                      className={`w-full p-2 rounded-lg border-2 transition-all text-left text-sm ${
                        designConfig.styleSpecs.neckline === neckline
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {neckline}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sleeve Style</label>
                <div className="space-y-2">
                  {['Full Sleeves', 'Half Sleeves', '3/4 Sleeves', 'Cap Sleeves', 'Sleeveless', 'Bell Sleeves', 'Puff Sleeves', 'Bishop Sleeves'].map((sleeve) => (
                    <button
                      key={sleeve}
                      onClick={() => updateConfig('styleSpecs', 'sleeveStyle', sleeve)}
                      className={`w-full p-2 rounded-lg border-2 transition-all text-left text-sm ${
                        designConfig.styleSpecs.sleeveStyle === sleeve
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {sleeve}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Back Style</label>
                <div className="space-y-2">
                  {['Regular', 'Deep Back', 'Keyhole', 'Tie-Up', 'Zipper', 'Button-Up', 'Criss-Cross', 'Open Back'].map((back) => (
                    <button
                      key={back}
                      onClick={() => updateConfig('styleSpecs', 'backStyle', back)}
                      className={`w-full p-2 rounded-lg border-2 transition-all text-left text-sm ${
                        designConfig.styleSpecs.backStyle === back
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {back}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Embellishments
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Embellishments & Work</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Kasavu Border', 'Zardozi Work', 'Mirror Work', 'Thread Embroidery', 
                'Beadwork', 'Sequins', 'Stone Work', 'Gota Work',
                'Aari Work', 'Kantha Stitch', 'Phulkari', 'Chikankari',
                'Block Print', 'Hand Painted', 'Applique Work', 'Cutwork'
              ].map((embellishment) => (
                <button
                  key={embellishment}
                  onClick={() => toggleEmbellishment(embellishment)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    designConfig.embellishments.includes(embellishment)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {embellishment}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Selected: {designConfig.embellishments.length > 0 ? designConfig.embellishments.join(', ') : 'None'}
              </p>
            </div>
          </div>
        );

      case 5: // Size & Fit
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Size & Fit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Standard Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Custom'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateConfig('sizeAndFit', 'size', size)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        designConfig.sizeAndFit.size === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Fit Preference</label>
                <div className="space-y-2">
                  {['Loose Fit', 'Regular Fit', 'Slim Fit', 'Body Hugging'].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => updateConfig('sizeAndFit', 'fitPreference', fit)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        designConfig.sizeAndFit.fitPreference === fit
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Occasion & Season
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Occasion & Season</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Occasion</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Wedding', 'Festival', 'Party', 'Casual', 
                    'Office', 'Religious', 'Engagement', 'Reception'
                  ].map((occasion) => (
                    <button
                      key={occasion}
                      onClick={() => updateConfig('contextual', 'occasion', occasion)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        designConfig.contextual.occasion === occasion
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Season & Price Range</label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Season</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Summer', 'Monsoon', 'Winter', 'All Season'].map((season) => (
                        <button
                          key={season}
                          onClick={() => updateConfig('contextual', 'season', season)}
                          className={`p-2 rounded-lg border-2 transition-all text-sm ${
                            designConfig.contextual.season === season
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Price Range</label>
                    <div className="space-y-2">
                      {['₹1,000 - ₹3,000', '₹3,000 - ₹7,000', '₹7,000 - ₹15,000', '₹15,000+'].map((price) => (
                        <button
                          key={price}
                          onClick={() => updateConfig('contextual', 'priceRange', price)}
                          className={`w-full p-2 rounded-lg border-2 transition-all text-left text-sm ${
                            designConfig.contextual.priceRange === price
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {price}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Generate Design
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Generate!</h3>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Design Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Style:</strong> {designConfig.styleSpecs.dressStyle || 'Not selected'}</p>
                  <p><strong>Fabric:</strong> {designConfig.styleSpecs.fabric || 'Not selected'}</p>
                  <p><strong>Color:</strong> {designConfig.styleSpecs.color || 'Not selected'}</p>
                  <p><strong>Occasion:</strong> {designConfig.contextual.occasion || 'Not selected'}</p>
                </div>
                <div>
                  <p><strong>Neckline:</strong> {designConfig.styleSpecs.neckline || 'Not selected'}</p>
                  <p><strong>Sleeves:</strong> {designConfig.styleSpecs.sleeveStyle || 'Not selected'}</p>
                  <p><strong>Size:</strong> {designConfig.sizeAndFit.size || 'Not selected'}</p>
                  <p><strong>Embellishments:</strong> {designConfig.embellishments.length || 0} selected</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-4">Click the button below to generate your AI-powered design!</p>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">AI will create a unique design based on your preferences</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Kerala & Indian Dress Designer
            </h1>
            <p className="text-lg text-gray-600 animate-fade-in">
              {iceBreakers[currentIceBreaker]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'designer'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-primary-50'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span>Designer</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'gallery'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-primary-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>Gallery ({gallery.length})</span>
            </button>
            {generatedDesign && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'preview'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-primary-50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Preview</span>
              </button>
            )}
          </div>
        </div>

        {/* Designer Tab */}
        {activeTab === 'designer' && (
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                {steps.map((step, index) => (
                  <span 
                    key={step}
                    className={`text-xs ${
                      index <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Design</span>
                  </>
                ) : (
                  <span>Next</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Gallery</h2>
              <p className="text-gray-600">Explore beautiful AI-generated Kerala and Indian dress designs</p>
            </div>

            {gallery.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No designs yet. Create your first design!</p>
                <button
                  onClick={() => setActiveTab('designer')}
                  className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Start Designing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((design) => (
                  <div key={design.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={design.imageUrl}
                        alt="Generated Design"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{design.prompt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{design.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{design.views}</span>
                          </div>
                        </div>
                        <span>{design.timestamp.toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => likeDesign(design.id)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && generatedDesign && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Generated Design</h2>
              <p className="text-gray-600">Here's your beautiful AI-generated Kerala dress design!</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={generatedDesign.imageUrl}
                    alt="Generated Design"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Design Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Style:</span>
                      <span className="font-medium">{generatedDesign.config.styleSpecs.dressStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fabric:</span>
                      <span className="font-medium">{generatedDesign.config.styleSpecs.fabric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{generatedDesign.config.styleSpecs.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occasion:</span>
                      <span className="font-medium">{generatedDesign.config.contextual.occasion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Embellishments:</span>
                      <span className="font-medium">{generatedDesign.config.embellishments.length} types</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">AI Prompt Used:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {generatedDesign.prompt}
                    </p>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => likeDesign(generatedDesign.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>Like ({generatedDesign.likes})</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setActiveTab('designer');
                        setGeneratedDesign(null);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-secondary-600 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Create Another Design</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Your Design</h3>
              <p className="text-gray-600 mb-4">{loadingMessage}</p>
              <div className="flex items-center justify-center space-x-2 text-primary-600">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">AI Magic in Progress...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DressDesigner;