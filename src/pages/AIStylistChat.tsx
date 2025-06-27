import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Send, 
  Save, 
  Share2, 
  ShoppingBag, 
  Volume2, 
  VolumeX,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  ChatMessage, 
  DesignPreference, 
  DesignSession,
  createDesignSession,
  addMessageToSession,
  extractDesignPreferences,
  generateAIResponse,
  textToSpeech,
  speechToText,
  saveDesign
} from '../lib/ai-stylist';
import { supabase } from '../lib/supabase';

const AIStylistChat: React.FC = () => {
  // State for session and messages
  const [session, setSession] = useState<DesignSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setError] = useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const newSession = await createDesignSession(user?.id);
      setSession(newSession);
      
      // Send welcome message
      if (newSession) {
        const welcomeMessage = "Hello! I'm your personal AI stylist. I'm here to help you design the perfect outfit. What type of garment are you looking for today?";
        const updatedSession = await addMessageToSession(newSession, 'assistant', welcomeMessage);
        setSession(updatedSession);
        
        // Play welcome message if audio is enabled
        if (audioEnabled) {
          const audioData = await textToSpeech(welcomeMessage);
          if (audioData) {
            playAudio(audioData);
          }
        }
      }
    };
    
    initSession();
    
    // Initialize audio player
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.onended = () => {
      setIsSpeaking(false);
    };
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);
  
  // Function to send a message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !session || loading) return;
    
    setLoading(true);
    
    // Add user message to session
    const updatedSession = await addMessageToSession(session, 'user', inputMessage);
    setSession(updatedSession);
    setInputMessage('');
    
    // Generate AI response
    const aiResponse = await generateAIResponse(inputMessage, updatedSession.messages);
    
    // Add AI response to session
    const finalSession = await addMessageToSession(updatedSession, 'assistant', aiResponse);
    setSession(finalSession);
    
    // Extract design preferences
    const preferences = extractDesignPreferences(finalSession.messages);
    setSession(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : null);
    
    // Play AI response if audio is enabled
    if (audioEnabled) {
      const audioData = await textToSpeech(aiResponse);
      if (audioData) {
        playAudio(audioData);
      }
    }
    
    setLoading(false);
  };
  
  // Function to handle voice input
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const transcript = await speechToText(audioBlob);
          
          if (transcript) {
            setInputMessage(transcript);
            // Auto-send the transcribed message
            setTimeout(() => {
              sendMessage();
            }, 500);
          }
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access your microphone. Please check your browser permissions.');
      }
    }
  };
  
  // Function to play audio
  const playAudio = (audioData: ArrayBuffer) => {
    if (!audioPlayerRef.current) return;
    
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    
    audioPlayerRef.current.src = url;
    audioPlayerRef.current.play();
    setIsSpeaking(true);
    
    // Clean up the URL when done
    audioPlayerRef.current.onended = () => {
      URL.revokeObjectURL(url);
      setIsSpeaking(false);
    };
  };
  
  // Function to toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsSpeaking(false);
    }
  };
  
  // Function to handle save design
  const handleSaveDesign = async () => {
    if (!user || !session) {
      alert('You must be logged in to save designs');
      return;
    }
    
    if (!designName.trim()) {
      setError('Please enter a name for your design');
      return;
    }
    
    setSaveLoading(true);
    setError('');
    
    // Generate a prompt for the design based on the conversation
    const aiPrompt = generateDesignPrompt(session.preferences);
    
    // Save the design to Supabase
    const designId = await saveDesign(
      user.id,
      session.id,
      designName,
      session.preferences,
      aiPrompt
    );
    
    if (designId) {
      setShowSaveModal(false);
      alert('Design saved successfully!');
    } else {
      setError('Failed to save design. Please try again.');
    }
    
    setSaveLoading(false);
  };
  
  // Function to generate a design prompt
  const generateDesignPrompt = (preferences: DesignPreference): string => {
    const parts = [];
    
    if (preferences.garmentType) {
      parts.push(`A beautiful ${preferences.garmentType}`);
    } else {
      parts.push('A beautiful garment');
    }
    
    if (preferences.fabricType) {
      parts.push(`made of ${preferences.fabricType}`);
    }
    
    if (preferences.color) {
      parts.push(`in ${preferences.color} color`);
    }
    
    if (preferences.neckline) {
      parts.push(`with a ${preferences.neckline} neckline`);
    }
    
    if (preferences.sleeveStyle) {
      parts.push(`and ${preferences.sleeveStyle} sleeves`);
    }
    
    if (preferences.embellishments && preferences.embellishments.length > 0) {
      parts.push(`adorned with ${preferences.embellishments.join(', ')}`);
    }
    
    if (preferences.occasion) {
      parts.push(`perfect for ${preferences.occasion} occasions`);
    }
    
    return parts.join(' ');
  };
  
  // Function to create an order from the current design
  const createOrder = () => {
    if (!user) {
      alert('You must be logged in to place an order');
      return;
    }
    
    // First save the design if not already saved
    if (!showSaveModal) {
      setShowSaveModal(true);
    } else {
      // Handle saving and then redirect to order form
      handleSaveDesign().then(() => {
        // Redirect to order form
        // This would typically navigate to your existing order creation form
        // with the design details pre-filled
        window.location.href = '/oms/dashboard';
      });
    }
  };
  
  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Section */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">AI Stylist Chat</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleAudio}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title={audioEnabled ? 'Mute' : 'Unmute'}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to start a new session? This will clear your current conversation.')) {
                        createDesignSession(user?.id).then(setSession);
                      }
                    }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="New Session"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary-100 text-gray-800'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } transition-colors`}
                  disabled={loading}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message here..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loading || isRecording}
                />
                <button
                  onClick={sendMessage}
                  className={`p-3 rounded-full ${
                    loading
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  } transition-colors`}
                  disabled={loading || !inputMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {isRecording && (
                <p className="text-center text-sm text-red-500 mt-2 animate-pulse">
                  Recording... Click the microphone icon to stop.
                </p>
              )}
              {isSpeaking && (
                <p className="text-center text-sm text-primary-600 mt-2">
                  AI is speaking...
                </p>
              )}
            </div>
          </div>
          
          {/* Design Summary Panel */}
          <div className="lg:w-1/3 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
              <h2 className="text-xl font-semibold">Design Summary</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Design Visualization */}
              <div className="mb-6 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {session?.preferences.garmentType ? (
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-2">
                      {session.preferences.garmentType === 'blouse' && (
                        <img 
                          src="https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Blouse" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {session.preferences.garmentType === 'lehenga' && (
                        <img 
                          src="https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Lehenga" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {session.preferences.garmentType === 'saree' && (
                        <img 
                          src="https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Saree" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {session.preferences.garmentType === 'dress' && (
                        <img 
                          src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Dress" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      {!['blouse', 'lehenga', 'saree', 'dress'].includes(session.preferences.garmentType) && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                          <Sparkles className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 capitalize">{session.preferences.garmentType}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Your design will appear here</p>
                  </div>
                )}
              </div>
              
              {/* Design Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Garment Type:</span>
                      <span className="font-medium capitalize">{session?.preferences.garmentType || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Fabric:</span>
                      <span className="font-medium capitalize">{session?.preferences.fabricType || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Color:</span>
                      {session?.preferences.color ? (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: session.preferences.color }}
                          ></div>
                          <span className="font-medium capitalize">{session.preferences.color}</span>
                        </div>
                      ) : (
                        <span className="font-medium">Not specified</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Occasion:</span>
                      <span className="font-medium capitalize">{session?.preferences.occasion || 'Not specified'}</span>
                    </div>
                    {session?.preferences.neckline && (
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Neckline:</span>
                        <span className="font-medium capitalize">{session.preferences.neckline}</span>
                      </div>
                    )}
                    {session?.preferences.sleeveStyle && (
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Sleeve Style:</span>
                        <span className="font-medium capitalize">{session.preferences.sleeveStyle}</span>
                      </div>
                    )}
                    {session?.preferences.embellishments && session.preferences.embellishments.length > 0 && (
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Embellishments:</span>
                        <span className="font-medium capitalize">{session.preferences.embellishments.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors"
                disabled={!session?.preferences.garmentType}
              >
                <Save className="w-5 h-5" />
                <span>Save Design</span>
              </button>
              <button
                onClick={createOrder}
                className="w-full flex items-center justify-center space-x-2 bg-secondary-600 text-white p-3 rounded-lg hover:bg-secondary-700 transition-colors"
                disabled={!session?.preferences.garmentType}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Create Order</span>
              </button>
              <Link
                to="/saved-designs"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span>View Saved Designs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Design Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Save Your Design</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="designName" className="block text-sm font-medium text-gray-700 mb-2">
                  Design Name
                </label>
                <input
                  type="text"
                  id="designName"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., My Red Silk Blouse"
                />
              </div>
              
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {saveError}
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Design Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Garment Type:</span>
                    <span className="font-medium capitalize">{session?.preferences.garmentType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fabric:</span>
                    <span className="font-medium capitalize">{session?.preferences.fabricType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium capitalize">{session?.preferences.color || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDesign}
                disabled={saveLoading || !designName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Design</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">AI Limitations Disclaimer:</p>
          <p>
            The AI stylist provides suggestions based on your conversation but may not capture all nuances of fashion design. 
            All designs are subject to review by our human stylists before final production. 
            The visual representations are for reference only and the final product may vary.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIStylistChat;