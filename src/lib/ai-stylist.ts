import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

// Types for AI Stylist
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DesignPreference {
  garmentType?: string;
  fabricType?: string;
  color?: string;
  pattern?: string;
  neckline?: string;
  sleeveStyle?: string;
  length?: string;
  embellishments?: string[];
  occasion?: string;
  style?: string;
}

export interface UserProfile {
  id: string;
  fullName?: string;
  preferences?: {
    favoriteColors?: string[];
    favoriteStyles?: string[];
    dislikedElements?: string[];
  };
  measurements?: {
    unit: 'cm' | 'inches';
    top?: Record<string, number>;
    bottom?: Record<string, number>;
  };
}

export interface DesignSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  preferences: DesignPreference;
  createdAt: Date;
  updatedAt: Date;
}

// ElevenLabs API integration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default voice ID

// Text to Speech using ElevenLabs
export const textToSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key is not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API error:', errorData);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    return null;
  }
};

// Speech to Text using ElevenLabs
export const speechToText = async (audioBlob: Blob): Promise<string | null> => {
  if (!ELEVENLABS_API_KEY) {
    console.error('ElevenLabs API key is not set');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model_id', 'whisper-1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs Speech-to-Text API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error calling ElevenLabs Speech-to-Text API:', error);
    return null;
  }
};

// Function to start a new design session
export const createDesignSession = async (userId?: string): Promise<DesignSession> => {
  const session: DesignSession = {
    id: uuidv4(),
    userId,
    messages: [],
    preferences: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (userId) {
    try {
      const { error } = await supabase.from('design_sessions').insert({
        id: session.id,
        user_id: userId,
        status: 'active',
        conversation_history: [],
        design_preferences: {},
      });

      if (error) {
        console.error('Error creating design session in Supabase:', error);
      }
    } catch (error) {
      console.error('Error creating design session:', error);
    }
  }

  return session;
};

// Function to save a message to the session
export const addMessageToSession = async (
  session: DesignSession,
  role: 'user' | 'assistant',
  content: string
): Promise<DesignSession> => {
  const message: ChatMessage = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
  };

  const updatedSession = {
    ...session,
    messages: [...session.messages, message],
    updatedAt: new Date(),
  };

  if (session.userId) {
    try {
      const { error } = await supabase
        .from('design_sessions')
        .update({
          conversation_history: updatedSession.messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          updated_at: updatedSession.updatedAt,
        })
        .eq('id', session.id);

      if (error) {
        console.error('Error updating design session in Supabase:', error);
      }
    } catch (error) {
      console.error('Error updating design session:', error);
    }
  }

  return updatedSession;
};

// Function to extract design preferences from conversation
export const extractDesignPreferences = (messages: ChatMessage[]): DesignPreference => {
  // This is a simplified implementation
  // In a real application, you would use a more sophisticated NLP approach
  // or leverage the AI model's capabilities to extract structured data
  
  const preferences: DesignPreference = {};
  
  // Look for key terms in the conversation
  messages.forEach(message => {
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      
      // Garment type
      if (content.includes('dress') || content.includes('gown')) {
        preferences.garmentType = 'dress';
      } else if (content.includes('blouse')) {
        preferences.garmentType = 'blouse';
      } else if (content.includes('lehenga')) {
        preferences.garmentType = 'lehenga';
      } else if (content.includes('saree')) {
        preferences.garmentType = 'saree';
      }
      
      // Fabric type
      if (content.includes('silk')) {
        preferences.fabricType = 'silk';
      } else if (content.includes('cotton')) {
        preferences.fabricType = 'cotton';
      } else if (content.includes('chiffon')) {
        preferences.fabricType = 'chiffon';
      } else if (content.includes('velvet')) {
        preferences.fabricType = 'velvet';
      }
      
      // Color
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'gold', 'silver'];
      colors.forEach(color => {
        if (content.includes(color)) {
          preferences.color = color;
        }
      });
      
      // Occasion
      if (content.includes('wedding') || content.includes('bridal')) {
        preferences.occasion = 'wedding';
      } else if (content.includes('party')) {
        preferences.occasion = 'party';
      } else if (content.includes('casual')) {
        preferences.occasion = 'casual';
      } else if (content.includes('formal')) {
        preferences.occasion = 'formal';
      }
    }
  });
  
  return preferences;
};

// Function to save a design
export const saveDesign = async (
  userId: string,
  sessionId: string,
  designName: string,
  preferences: DesignPreference,
  aiPrompt: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_designs')
      .insert({
        user_id: userId,
        session_id: sessionId,
        design_name: designName,
        garment_type: preferences.garmentType || '',
        fabric_details: { type: preferences.fabricType, color: preferences.color },
        style_elements: {
          neckline: preferences.neckline,
          sleeveStyle: preferences.sleeveStyle,
          length: preferences.length,
          embellishments: preferences.embellishments,
        },
        ai_generated_prompt: aiPrompt,
        share_token: uuidv4().substring(0, 8),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving design:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving design:', error);
    return null;
  }
};

// Function to get saved designs for a user
export const getUserSavedDesigns = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved designs:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching saved designs:', error);
    return [];
  }
};

// Function to create an order from a saved design
export const createOrderFromDesign = async (
  designId: string,
  userId: string,
  shippingDetails: any,
  specialInstructions: string
) => {
  try {
    const { data, error } = await supabase
      .from('design_orders')
      .insert({
        design_id: designId,
        user_id: userId,
        shipping_details: shippingDetails,
        special_instructions: specialInstructions,
        status: 'pending',
        estimated_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Generate AI response based on user input and conversation history
export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  // In a real implementation, this would call an external AI service like OpenAI
  // For now, we'll use a simple rule-based approach for demonstration
  
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Greeting
  if (conversationHistory.length === 0 || 
      lowerCaseMessage.includes('hello') || 
      lowerCaseMessage.includes('hi') || 
      lowerCaseMessage.includes('hey')) {
    return "Hello! I'm your personal AI stylist. I'm here to help you design the perfect outfit. What type of garment are you looking for today? Perhaps a blouse, lehenga, saree, or dress?";
  }
  
  // Garment type inquiry
  if (lowerCaseMessage.includes('blouse')) {
    return "Great choice! Designer blouses are our specialty. What fabric would you prefer? We have silk, cotton, georgette, and many more options.";
  } else if (lowerCaseMessage.includes('lehenga')) {
    return "Lehengas are a beautiful choice! Are you looking for something for a special occasion like a wedding, or something more casual?";
  } else if (lowerCaseMessage.includes('saree')) {
    return "Sarees are timeless! Would you prefer a traditional design or something more contemporary?";
  } else if (lowerCaseMessage.includes('dress') || lowerCaseMessage.includes('gown')) {
    return "Dresses and gowns are perfect for making a statement. What's the occasion you're shopping for?";
  }
  
  // Fabric inquiry
  if (lowerCaseMessage.includes('silk')) {
    return "Silk is a luxurious choice! It drapes beautifully and has a natural sheen. What color are you thinking of?";
  } else if (lowerCaseMessage.includes('cotton')) {
    return "Cotton is comfortable and breathable, perfect for everyday wear. Do you have a color preference?";
  } else if (lowerCaseMessage.includes('georgette')) {
    return "Georgette has a lovely flow and is great for draped designs. What color would you like?";
  }
  
  // Color inquiry
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'gold', 'silver'];
  for (const color of colors) {
    if (lowerCaseMessage.includes(color)) {
      return `${color.charAt(0).toUpperCase() + color.slice(1)} is a beautiful choice! Would you like any embellishments or embroidery on your garment?`;
    }
  }
  
  // Embellishment inquiry
  if (lowerCaseMessage.includes('embroidery') || lowerCaseMessage.includes('embellish')) {
    return "We can add beautiful embroidery to your design. Would you prefer traditional motifs, floral patterns, or something more contemporary?";
  }
  
  // Occasion inquiry
  if (lowerCaseMessage.includes('wedding') || lowerCaseMessage.includes('bridal')) {
    return "Wedding attire should be special! We can create something truly unique for your big day. Would you like heavy embellishments or something more subtle?";
  } else if (lowerCaseMessage.includes('party')) {
    return "Party wear can be fun and glamorous! Are you thinking of something bold or elegant?";
  } else if (lowerCaseMessage.includes('casual')) {
    return "Casual wear can still be stylish! Would you prefer something comfortable for everyday use?";
  }
  
  // Default response
  return "I understand. Can you tell me more about what you're looking for? Perhaps you can describe the style, color, or occasion you have in mind?";
};