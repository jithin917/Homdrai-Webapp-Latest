import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with better configuration for network issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      // Add timeout and better error handling - increased timeout to 120 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Types matching the database schema
export interface BulkOrderInquiry {
  id: string;
  company_name: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  company_address: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  business_type: string;
  product_category: string;
  order_quantity: string;
  order_frequency: string;
  target_price?: string;
  quality_requirements: string;
  delivery_timeline: string;
  packaging_requirements?: string;
  certification_needs?: string;
  additional_requirements?: string;
  submission_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StitchingPartnership {
  id: string;
  unit_name: string;
  owner_name: string;
  email: string;
  phone: string;
  unit_address: string;
  city: string;
  state: string;
  established_year: number;
  total_workers: string;
  machine_capacity: string;
  monthly_capacity: string;
  specializations: string;
  quality_certifications?: string;
  current_clients?: string;
  average_order_value?: string;
  payment_terms: string;
  working_hours: string;
  quality_control_process: string;
  sample_capability: string;
  business_references?: string;
  submission_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InquiryNote {
  id: string;
  inquiry_id: string;
  inquiry_type: 'bulk_order' | 'partnership';
  communication_log: string;
  special_requirements: string;
  invoice_details: string;
  order_copy: string;
  priority_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface FollowUp {
  id: string;
  inquiry_id: string;
  inquiry_type: 'bulk_order' | 'partnership';
  follow_up_date: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface PartnerLogin {
  id: string;
  partnership_id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  first_login: boolean;
  activation_token?: string;
  credentials_sent: boolean;
  credentials_sent_at?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerDocument {
  id: string;
  partnership_id: string;
  document_type: string;
  document_name: string;
  document_url?: string;
  file_size?: number;
  mime_type?: string;
  is_required: boolean;
  is_submitted: boolean;
  submission_date?: string;
  admin_review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  admin_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  is_locked?: boolean;
  current_version_id?: string;
  total_versions?: number;
  last_viewed_at?: string;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  document_url: string;
  file_size?: number;
  mime_type?: string;
  upload_reason:
    | 'initial_submission'
    | 'revision_requested'
    | 'voluntary_update';
  uploaded_by: string;
  upload_date: string;
  is_current_version: boolean;
  replaced_by_version_id?: string;
  created_at: string;
}

export interface DocumentViewLog {
  id: string;
  document_id: string;
  document_version_id?: string;
  viewer_type: 'admin' | 'partner';
  viewer_name: string;
  viewer_ip?: string;
  view_timestamp: string;
  access_method: 'direct' | 'download' | 'preview';
}

interface DocumentAccessToken {
  id: string;
  document_id: string;
  document_version_id?: string;
  access_token: string;
  created_by: string;
  created_for: string;
  expires_at: string;
  is_active: boolean;
  access_count: number;
  max_access_count: number;
  created_at: string;
}

export interface DocumentReview {
  id: string;
  document_id: string;
  partnership_id: string;
  reviewer_name: string;
  review_status: 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  created_at: string;
}

// Enhanced error handling function
const handleNetworkError = (error: any, operation: string) => {
  console.error(`Network error during ${operation}:`, error);

  // Check for specific error types
  if (error.name === 'AbortError') {
    throw new Error(
      `Request timeout. The server took too long to respond. Please try again.`
    );
  }

  if (
    error.message?.includes('NetworkError') ||
    error.message?.includes('Failed to fetch')
  ) {
    throw new Error(`Unable to connect to the database server. This could be due to:
    • Network connectivity issues
    • Server maintenance
    • CORS configuration problems
    Please check your internet connection and try again in a few moments.`);
  }

  if (error.message?.includes('CORS')) {
    throw new Error(
      `Connection blocked by browser security policy. Please contact the system administrator.`
    );
  }

  if (error.code === 'PGRST116') {
    throw new Error(`Database query error: ${error.message}`);
  }

  if (error.code && error.code.startsWith('PGRST')) {
    throw new Error(`Database error (${error.code}): ${error.message}`);
  }

  // Generic error fallback
  throw new Error(
    `Operation failed: ${error.message || 'Unknown error occurred'}`
  );
};

// Connection test with retry logic
const testConnectionWithRetry = async (maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connection test attempt ${attempt}/${maxRetries}...`);

      const { data, error, count } = await supabase
        .from('bulk_order_inquiries')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        throw error;
      }

      console.log(`Connection test successful on attempt ${attempt}`);
      return { success: true, data, error: null, count };
    } catch (error) {
      console.error(`Connection test attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Failed to connect after ${maxRetries} attempts: ${error.message}`,
          lastError: error,
        };
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
};

// API functions with enhanced error handling
export const api = {
  // Test database connection with retry logic
  testConnection: async () => {
    try {
      console.log('Testing database connection...');
      console.log('Supabase URL:', supabaseUrl);
      console.log('Using anon key:', supabaseAnonKey ? 'Present' : 'Missing');

      return await testConnectionWithRetry();
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Admin login - supports both admin accounts
  adminLogin: async (username: string, password: string) => {
    console.log('Admin login attempt:', username);
    if (
      (username === 'admin' && password === 'admin123') ||
      (username === 'abcd' && password === '1234')
    ) {
      console.log('Login successful');
      return { success: true, token: 'admin-authenticated' };
    }
    console.log('Login failed');
    return { success: false };
  },

  // Partner login with improved error handling and first-time login support
  partnerLogin: async (username: string, password: string) => {
    try {
      console.log('Partner login attempt:', username);

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      console.log('Connection verified, querying partner login...');

      const { data, error } = await supabase
        .from('partner_logins')
        .select(
          `
          *,
          stitching_partnerships (
            id,
            unit_name,
            owner_name,
            email,
            status
          )
        `
        )
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Partner login query error:', error);
        handleNetworkError(error, 'partner login query');
      }

      if (!data) {
        console.log('No partner found with username:', username);
        return {
          success: false,
          message: 'Invalid username or account not active',
        };
      }

      // For demo purposes, accept any password for first login or 'password123' for regular login
      const isValidPassword = data.first_login || password === 'password123';

      if (!isValidPassword) {
        return { success: false, message: 'Invalid password' };
      }

      // Update last login
      try {
        await supabase
          .from('partner_logins')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError);
        // Don't fail the login for this
      }

      console.log('Partner login successful');
      return {
        success: true,
        token: 'partner-authenticated',
        partner: data,
        isFirstLogin: data.first_login,
      };
    } catch (error) {
      console.error('Partner login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed due to network error',
      };
    }
  },

  // Set partner password (for first-time login)
  setPartnerPassword: async (partnerLoginId: string, newPassword: string) => {
    try {
      console.log('Setting partner password for:', partnerLoginId);

      // In production, hash the password properly
      const passwordHash =
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // demo hash

      const { data, error } = await supabase
        .from('partner_logins')
        .update({
          password_hash: passwordHash,
          first_login: false,
          activation_token: null,
        })
        .eq('id', partnerLoginId)
        .select();

      if (error) {
        console.error('Error setting password:', error);
        handleNetworkError(error, 'setting password');
      }

      console.log('Password set successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error setting password:', error);
      return { success: false, message: error.message };
    }
  },

  // Generate partner credentials (admin function)
  generatePartnerCredentials: async (partnershipId: string) => {
    try {
      console.log('Generating credentials for partnership:', partnershipId);

      const { data, error } = await supabase.rpc(
        'generate_partner_credentials',
        { partnership_id_param: partnershipId }
      );

      if (error) {
        console.error('Error generating credentials:', error);
        handleNetworkError(error, 'generating credentials');
      }

      console.log('Credentials generated successfully:', data);
      return { success: true, credentials: data[0] };
    } catch (error) {
      console.error('Error generating credentials:', error);
      return { success: false, message: error.message };
    }
  },

  // Mark credentials as sent
  markCredentialsSent: async (partnershipId: string) => {
    try {
      console.log(
        'Marking credentials as sent for partnership:',
        partnershipId
      );

      const { data, error } = await supabase
        .from('partner_logins')
        .update({
          credentials_sent: true,
          credentials_sent_at: new Date().toISOString(),
        })
        .eq('partnership_id', partnershipId)
        .select();

      if (error) {
        console.error('Error marking credentials as sent:', error);
        handleNetworkError(error, 'marking credentials as sent');
      }

      // Also update partnership status
      await supabase
        .from('stitching_partnerships')
        .update({ status: 'credentials_sent' })
        .eq('id', partnershipId);

      console.log('Credentials marked as sent successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error marking credentials as sent:', error);
      return { success: false, message: error.message };
    }
  },

  // Get partner login info
  getPartnerLoginInfo: async (partnershipId: string) => {
    try {
      console.log('Getting partner login info for:', partnershipId);

      const { data, error } = await supabase
        .from('partner_logins')
        .select('*')
        .eq('partnership_id', partnershipId)
        .maybeSingle();

      if (error) {
        console.error('Error getting partner login info:', error);
        handleNetworkError(error, 'getting partner login info');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error getting partner login info:', error);
      return { success: false, message: error.message };
    }
  },

  // Get bulk order inquiries with retry logic
  getBulkOrderInquiries: async (): Promise<BulkOrderInquiry[]> => {
    try {
      console.log('Fetching bulk order inquiries...');

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const { data, error } = await supabase
        .from('bulk_order_inquiries')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) {
        console.error('Supabase error fetching bulk orders:', error);
        handleNetworkError(error, 'fetching bulk orders');
      }

      console.log('Bulk order inquiries fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      handleNetworkError(error, 'fetching bulk orders');
      return [];
    }
  },

  // Create bulk order inquiry
  createBulkOrderInquiry: async (formData: any) => {
    try {
      console.log('Creating bulk order inquiry:', formData);

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const { data, error } = await supabase
        .from('bulk_order_inquiries')
        .insert([
          {
            company_name: formData.companyName,
            contact_person: formData.contactPerson,
            designation: formData.designation,
            email: formData.email,
            phone: formData.phone,
            company_address: formData.companyAddress,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            website: formData.website || null,
            business_type: formData.businessType,
            product_category: formData.productCategory,
            order_quantity: formData.orderQuantity,
            order_frequency: formData.orderFrequency,
            target_price: formData.targetPrice || null,
            quality_requirements: formData.qualityRequirements,
            delivery_timeline: formData.deliveryTimeline,
            packaging_requirements: formData.packagingRequirements || null,
            certification_needs: formData.certificationNeeds || null,
            additional_requirements: formData.additionalRequirements || null,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error creating bulk order:', error);
        handleNetworkError(error, 'creating bulk order');
      }

      console.log('Bulk order inquiry created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating bulk order:', error);
      handleNetworkError(error, 'creating bulk order');
      throw error;
    }
  },

  // Get stitching partnerships with retry logic
  getStitchingPartnerships: async (): Promise<StitchingPartnership[]> => {
    try {
      console.log('Fetching stitching partnerships...');

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const { data, error } = await supabase
        .from('stitching_partnerships')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) {
        console.error('Supabase error fetching partnerships:', error);
        handleNetworkError(error, 'fetching partnerships');
      }

      console.log('Stitching partnerships fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching partnerships:', error);
      handleNetworkError(error, 'fetching partnerships');
      return [];
    }
  },

  // Create stitching partnership
  createStitchingPartnership: async (formData: any) => {
    try {
      console.log('Creating stitching partnership:', formData);

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const { data, error } = await supabase
        .from('stitching_partnerships')
        .insert([
          {
            unit_name: formData.unitName,
            owner_name: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            unit_address: formData.unitAddress,
            city: formData.city,
            state: formData.state,
            established_year: parseInt(formData.establishedYear),
            total_workers: formData.totalWorkers,
            machine_capacity: formData.machineCapacity,
            monthly_capacity: formData.monthlyCapacity,
            specializations: formData.specializations,
            quality_certifications: formData.qualityCertifications || null,
            current_clients: formData.currentClients || null,
            average_order_value: formData.averageOrderValue || null,
            payment_terms: formData.paymentTerms,
            working_hours: formData.workingHours,
            quality_control_process: formData.qualityControlProcess,
            sample_capability: formData.sampleCapability,
            business_references: formData.businessReferences || null,
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error creating partnership:', error);
        handleNetworkError(error, 'creating partnership');
      }

      console.log('Stitching partnership created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating partnership:', error);
      handleNetworkError(error, 'creating partnership');
      throw error;
    }
  },

  // Update status
  updateStatus: async (type: string, id: string, status: string) => {
    try {
      console.log(`Updating status for ${type} ${id} to ${status}`);

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const table =
        type === 'bulk-order'
          ? 'bulk_order_inquiries'
          : 'stitching_partnerships';

      const { data, error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error updating status:', error);
        handleNetworkError(error, 'updating status');
      }

      console.log('Status updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating status:', error);
      handleNetworkError(error, 'updating status');
      throw error;
    }
  },

  // Notes and communication functions
  getInquiryNotes: async (inquiryId: string): Promise<InquiryNote | null> => {
    try {
      console.log('Fetching notes for inquiry:', inquiryId);
      const { data, error } = await supabase
        .from('inquiry_notes')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notes:', error);
        handleNetworkError(error, 'fetching notes');
      }

      console.log('Notes fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      handleNetworkError(error, 'fetching notes');
      return null;
    }
  },

  saveInquiryNotes: async (
    inquiryId: string,
    inquiryType: 'bulk_order' | 'partnership',
    notesData: any
  ) => {
    try {
      console.log('Saving notes for:', inquiryId, notesData);

      // Check if notes already exist
      const existingNotes = await api.getInquiryNotes(inquiryId);
      console.log('Existing notes:', existingNotes);

      const notePayload = {
        communication_log: notesData.communication_log || '',
        special_requirements: notesData.special_requirements || '',
        invoice_details: notesData.invoice_details || '',
        order_copy: notesData.order_copy || '',
        priority_level: notesData.priority_level || 'medium',
      };

      if (existingNotes) {
        // Update existing notes
        console.log('Updating existing notes with payload:', notePayload);
        const { data, error } = await supabase
          .from('inquiry_notes')
          .update(notePayload)
          .eq('inquiry_id', inquiryId)
          .select();

        if (error) {
          console.error('Error updating notes:', error);
          handleNetworkError(error, 'updating notes');
        }

        console.log('Notes updated successfully:', data);
        return data;
      } else {
        // Create new notes
        const insertPayload = {
          inquiry_id: inquiryId,
          inquiry_type: inquiryType,
          ...notePayload,
        };
        console.log('Creating new notes with payload:', insertPayload);

        const { data, error } = await supabase
          .from('inquiry_notes')
          .insert([insertPayload])
          .select();

        if (error) {
          console.error('Error creating notes:', error);
          handleNetworkError(error, 'creating notes');
        }

        console.log('Notes created successfully:', data);
        return data;
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      handleNetworkError(error, 'saving notes');
      throw error;
    }
  },

  // Follow-up functions
  getFollowUps: async (inquiryId?: string): Promise<FollowUp[]> => {
    try {
      console.log('Fetching follow-ups for inquiry:', inquiryId);
      let query = supabase
        .from('follow_ups')
        .select('*')
        .order('follow_up_date', { ascending: true });

      if (inquiryId) {
        query = query.eq('inquiry_id', inquiryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching follow-ups:', error);
        handleNetworkError(error, 'fetching follow-ups');
      }

      console.log('Follow-ups fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      handleNetworkError(error, 'fetching follow-ups');
      return [];
    }
  },

  getTodaysFollowUps: async (): Promise<FollowUp[]> => {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      console.log(
        "Fetching today's follow-ups between:",
        startOfDay.toISOString(),
        'and',
        endOfDay.toISOString()
      );

      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .gte('follow_up_date', startOfDay.toISOString())
        .lt('follow_up_date', endOfDay.toISOString())
        .eq('status', 'pending')
        .order('follow_up_date', { ascending: true });

      if (error) {
        console.error("Error fetching today's follow-ups:", error);
        handleNetworkError(error, "fetching today's follow-ups");
      }

      console.log("Today's follow-ups fetched:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Error fetching today's follow-ups:", error);
      handleNetworkError(error, "fetching today's follow-ups");
      return [];
    }
  },

  saveFollowUp: async (
    inquiryId: string,
    inquiryType: 'bulk_order' | 'partnership',
    followUpData: any
  ) => {
    try {
      console.log('Saving follow-up for:', inquiryId, followUpData);

      // Validate that follow_up_date is provided and valid
      if (!followUpData.follow_up_date) {
        console.error('Follow-up date is required');
        throw new Error('Follow-up date is required');
      }

      // Ensure the date is in proper ISO format
      const followUpDate = new Date(followUpData.follow_up_date);
      if (isNaN(followUpDate.getTime())) {
        console.error('Invalid follow-up date:', followUpData.follow_up_date);
        throw new Error('Invalid follow-up date format');
      }

      const followUpPayload = {
        inquiry_id: inquiryId,
        inquiry_type: inquiryType,
        follow_up_date: followUpDate.toISOString(),
        title: followUpData.title || 'Follow-up reminder',
        description: followUpData.description || '',
        status: 'pending',
      };

      console.log('Follow-up payload:', followUpPayload);

      const { data, error } = await supabase
        .from('follow_ups')
        .insert([followUpPayload])
        .select();

      if (error) {
        console.error('Error creating follow-up:', error);
        handleNetworkError(error, 'creating follow-up');
      }

      console.log('Follow-up created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving follow-up:', error);
      handleNetworkError(error, 'saving follow-up');
      throw error;
    }
  },

  updateFollowUpStatus: async (
    followUpId: string,
    status: 'pending' | 'completed' | 'cancelled'
  ) => {
    try {
      console.log('Updating follow-up status:', followUpId, status);
      const { data, error } = await supabase
        .from('follow_ups')
        .update({ status })
        .eq('id', followUpId)
        .select();

      if (error) {
        console.error('Error updating follow-up status:', error);
        handleNetworkError(error, 'updating follow-up status');
      }

      console.log('Follow-up status updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating follow-up status:', error);
      handleNetworkError(error, 'updating follow-up status');
      throw error;
    }
  },

  // Get follow-ups for a specific inquiry
  getInquiryFollowUps: async (inquiryId: string): Promise<FollowUp[]> => {
    try {
      console.log('Fetching follow-ups for inquiry:', inquiryId);
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('follow_up_date', { ascending: false });

      if (error) {
        console.error('Error fetching inquiry follow-ups:', error);
        handleNetworkError(error, 'fetching inquiry follow-ups');
      }

      console.log('Inquiry follow-ups fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching inquiry follow-ups:', error);
      handleNetworkError(error, 'fetching inquiry follow-ups');
      return [];
    }
  },

  // Update follow-up with new data (for editing)
  updateFollowUp: async (followUpId: string, followUpData: any) => {
    try {
      console.log('Updating follow-up:', followUpId, followUpData);

      const updatePayload: any = {};

      if (followUpData.follow_up_date) {
        const followUpDate = new Date(followUpData.follow_up_date);
        if (!isNaN(followUpDate.getTime())) {
          updatePayload.follow_up_date = followUpDate.toISOString();
        }
      }

      if (followUpData.title) {
        updatePayload.title = followUpData.title;
      }

      if (followUpData.description !== undefined) {
        updatePayload.description = followUpData.description;
      }

      if (followUpData.status) {
        updatePayload.status = followUpData.status;
      }

      console.log('Update payload:', updatePayload);

      const { data, error } = await supabase
        .from('follow_ups')
        .update(updatePayload)
        .eq('id', followUpId)
        .select();

      if (error) {
        console.error('Error updating follow-up:', error);
        handleNetworkError(error, 'updating follow-up');
      }

      console.log('Follow-up updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating follow-up:', error);
      handleNetworkError(error, 'updating follow-up');
      throw error;
    }
  },

  // Delete follow-up
  deleteFollowUp: async (followUpId: string) => {
    try {
      console.log('Deleting follow-up:', followUpId);
      const { data, error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', followUpId)
        .select();

      if (error) {
        console.error('Error deleting follow-up:', error);
        handleNetworkError(error, 'deleting follow-up');
      }

      console.log('Follow-up deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      handleNetworkError(error, 'deleting follow-up');
      throw error;
    }
  },

  // Partner document management functions
  getPartnerDocuments: async (
    partnershipId: string
  ): Promise<PartnerDocument[]> => {
    try {
      console.log('Fetching documents for partnership:', partnershipId);
      const { data, error } = await supabase
        .from('partner_documents')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('document_type', { ascending: true });

      if (error) {
        console.error('Error fetching partner documents:', error);
        handleNetworkError(error, 'fetching partner documents');
      }

      console.log('Partner documents fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching partner documents:', error);
      handleNetworkError(error, 'fetching partner documents');
      return [];
    }
  },

  // Submit partner document with versioning
  submitPartnerDocument: async (documentId: string, documentData: any) => {
    try {
      console.log('Submitting document:', documentId, documentData);

      // Check if document is locked
      const { data: docCheck, error: checkError } = await supabase
        .from('partner_documents')
        .select('is_locked, admin_review_status')
        .eq('id', documentId)
        .single();

      if (checkError) {
        console.error('Error checking document status:', checkError);
        handleNetworkError(checkError, 'checking document status');
      }

      if (docCheck?.is_locked && docCheck?.admin_review_status === 'approved') {
        throw new Error(
          'This document has been approved and is locked. Contact admin to request changes.'
        );
      }

      // Create new document version
      const { data: versionData, error: versionError } = await supabase.rpc(
        'create_document_version',
        {
          p_document_id: documentId,
          p_document_url: documentData.document_url,
          p_file_size: documentData.file_size,
          p_mime_type: documentData.mime_type,
          p_upload_reason:
            docCheck?.admin_review_status === 'needs_revision'
              ? 'revision_requested'
              : 'voluntary_update',
          p_uploaded_by: 'Partner', // In production, get from auth context
        }
      );

      if (versionError) {
        console.error('Error creating document version:', versionError);
        handleNetworkError(versionError, 'creating document version');
      }

      // Update document status
      const { data, error } = await supabase
        .from('partner_documents')
        .update({
          is_submitted: true,
          submission_date: new Date().toISOString(),
          admin_review_status: 'pending',
          admin_comments: null,
          reviewed_by: null,
          reviewed_at: null,
        })
        .eq('id', documentId)
        .select();

      if (error) {
        console.error('Error submitting document:', error);
        handleNetworkError(error, 'submitting document');
      }

      console.log('Document submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error submitting document:', error);
      handleNetworkError(error, 'submitting document');
      throw error;
    }
  },

  reviewPartnerDocument: async (documentId: string, reviewData: any) => {
    try {
      console.log('Reviewing document:', documentId, reviewData);

      // Update document review status
      const { data: docData, error: docError } = await supabase
        .from('partner_documents')
        .update({
          admin_review_status: reviewData.status,
          admin_comments: reviewData.comments,
          reviewed_by: reviewData.reviewer_name,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select();

      if (docError) {
        console.error('Error updating document review:', docError);
        handleNetworkError(docError, 'updating document review');
      }

      // Add review history
      const { data: reviewHistoryData, error: reviewError } = await supabase
        .from('document_reviews')
        .insert([
          {
            document_id: documentId,
            partnership_id: reviewData.partnership_id,
            reviewer_name: reviewData.reviewer_name,
            review_status: reviewData.status,
            comments: reviewData.comments,
          },
        ])
        .select();

      if (reviewError) {
        console.error('Error creating review history:', reviewError);
        handleNetworkError(reviewError, 'creating review history');
      }

      console.log('Document reviewed successfully:', {
        docData,
        reviewHistoryData,
      });
      return { document: docData, review: reviewHistoryData };
    } catch (error) {
      console.error('Error reviewing document:', error);
      handleNetworkError(error, 'reviewing document');
      throw error;
    }
  },

  getDocumentReviews: async (documentId: string): Promise<DocumentReview[]> => {
    try {
      console.log('Fetching document reviews for:', documentId);
      const { data, error } = await supabase
        .from('document_reviews')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching document reviews:', error);
        handleNetworkError(error, 'fetching document reviews');
      }

      console.log('Document reviews fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching document reviews:', error);
      handleNetworkError(error, 'fetching document reviews');
      return [];
    }
  },

  requestDocuments: async (partnershipId: string) => {
    try {
      console.log('Requesting documents for partnership:', partnershipId);

      // Update partnership status to documents_requested
      const { data, error } = await supabase
        .from('stitching_partnerships')
        .update({ status: 'documents_requested' })
        .eq('id', partnershipId)
        .select();

      if (error) {
        console.error('Error requesting documents:', error);
        handleNetworkError(error, 'requesting documents');
      }

      console.log('Documents requested successfully:', data);
      return data;
    } catch (error) {
      console.error('Error requesting documents:', error);
      handleNetworkError(error, 'requesting documents');
      throw error;
    }
  },

  // Get all partnerships with document status - enhanced with better error handling
  getPartnershipsWithDocuments: async () => {
    try {
      console.log('Fetching partnerships with document status...');

      // Test connection first
      const connectionTest = await api.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection failed: ' + connectionTest.error);
      }

      const { data, error } = await supabase
        .from('stitching_partnerships')
        .select(
          `
          *,
          partner_documents (
            id,
            partnership_id,
            document_type,
            document_name,
            is_required,
            is_submitted,
            admin_review_status,
            submission_date,
            is_locked,
            total_versions,
            view_count,
            last_viewed_at
          ),
          partner_logins (
            id,
            username,
            first_login,
            credentials_sent,
            credentials_sent_at,
            last_login,
            is_active
          )
        `
        )
        .order('submission_date', { ascending: false });

      if (error) {
        console.error('Error fetching partnerships with documents:', error);
        handleNetworkError(error, 'fetching partnerships with documents');
      }

      console.log('Partnerships with documents fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching partnerships with documents:', error);
      handleNetworkError(error, 'fetching partnerships with documents');
      return [];
    }
  },

  // Document versioning functions
  getDocumentVersions: async (
    documentId: string
  ): Promise<DocumentVersion[]> => {
    try {
      console.log('Fetching document versions for:', documentId);
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching document versions:', error);
        handleNetworkError(error, 'fetching document versions');
      }

      console.log('Document versions fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching document versions:', error);
      handleNetworkError(error, 'fetching document versions');
      return [];
    }
  },

  // Generate secure document access token
  generateDocumentAccessToken: async (
    documentId: string,
    documentVersionId?: string,
    createdFor: string = 'Admin Review'
  ) => {
    try {
      console.log('Generating access token for document:', documentId);
      const { data, error } = await supabase.rpc(
        'generate_document_access_token',
        {
          p_document_id: documentId,
          p_document_version_id: documentVersionId,
          p_created_by: 'Admin User', // In production, get from auth context
          p_created_for: createdFor,
          p_expires_hours: 24,
          p_max_access_count: 10,
        }
      );

      if (error) {
        console.error('Error generating access token:', error);
        handleNetworkError(error, 'generating access token');
      }

      console.log('Access token generated successfully');
      return { success: true, token: data };
    } catch (error) {
      console.error('Error generating access token:', error);
      handleNetworkError(error, 'generating access token');
      return { success: false, message: error.message };
    }
  },

  // Validate and use access token
  validateAccessToken: async (accessToken: string) => {
    try {
      console.log('Validating access token');
      const { data, error } = await supabase.rpc('validate_access_token', {
        p_access_token: accessToken,
      });

      if (error) {
        console.error('Error validating access token:', error);
        handleNetworkError(error, 'validating access token');
      }

      console.log('Access token validation result:', data);
      return data?.[0] || { is_valid: false };
    } catch (error) {
      console.error('Error validating access token:', error);
      handleNetworkError(error, 'validating access token');
      return { is_valid: false };
    }
  },

  // Log document view
  logDocumentView: async (
    documentId: string,
    documentVersionId?: string,
    viewerType: 'admin' | 'partner' = 'admin',
    viewerName: string = 'Admin User',
    accessMethod: string = 'direct'
  ) => {
    try {
      console.log('Logging document view:', documentId);
      const { data, error } = await supabase.rpc('log_document_view', {
        p_document_id: documentId,
        p_document_version_id: documentVersionId,
        p_viewer_type: viewerType,
        p_viewer_name: viewerName,
        p_viewer_ip: null, // Could be obtained from request headers in production
        p_access_method: accessMethod,
      });

      if (error) {
        console.error('Error logging document view:', error);
        handleNetworkError(error, 'logging document view');
      }

      console.log('Document view logged successfully');
      return { success: true };
    } catch (error) {
      console.error('Error logging document view:', error);
      handleNetworkError(error, 'logging document view');
      return { success: false, message: error.message };
    }
  },

  // Get document view logs
  getDocumentViewLogs: async (
    documentId: string
  ): Promise<DocumentViewLog[]> => {
    try {
      console.log('Fetching document view logs for:', documentId);
      const { data, error } = await supabase
        .from('document_view_logs')
        .select('*')
        .eq('document_id', documentId)
        .order('view_timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching document view logs:', error);
        handleNetworkError(error, 'fetching document view logs');
      }

      console.log('Document view logs fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching document view logs:', error);
      handleNetworkError(error, 'fetching document view logs');
      return [];
    }
  },
};
