/*
  # Insert sample data for testing

  1. Sample Data
    - Insert 2 bulk order inquiries with realistic data
    - Insert 2 stitching partnership applications with realistic data
    - Various status levels for testing admin panel functionality

  2. Data Coverage
    - Different business types and product categories
    - Various order quantities and frequencies
    - Different partnership unit sizes and capabilities
*/

-- Insert sample bulk order inquiries
INSERT INTO bulk_order_inquiries (
  company_name,
  contact_person,
  designation,
  email,
  phone,
  company_address,
  city,
  state,
  country,
  website,
  business_type,
  product_category,
  order_quantity,
  order_frequency,
  target_price,
  quality_requirements,
  delivery_timeline,
  packaging_requirements,
  certification_needs,
  additional_requirements,
  status
) VALUES 
(
  'Fashion Forward Pvt Ltd',
  'Priya Sharma',
  'Procurement Manager',
  'priya.sharma@fashionforward.com',
  '+91 98765 43210',
  '123 MG Road, Commercial Complex',
  'Mumbai',
  'Maharashtra',
  'India',
  'https://fashionforward.com',
  'retailer',
  'blouses',
  '500-1000',
  'monthly',
  '₹800-1200 per piece',
  'premium',
  '3-4 weeks',
  'Individual poly bags with brand labels',
  'OEKO-TEX Standard 100',
  'Need consistent quality for our premium retail chain. Looking for long-term partnership.',
  'Contacted'
),
(
  'Global Textiles Export House',
  'Rajesh Kumar',
  'Export Director',
  'rajesh@globaltextiles.in',
  '+91 87654 32109',
  '456 Export Bhavan, Sector 18',
  'Noida',
  'Uttar Pradesh',
  'India',
  'https://globaltextiles.in',
  'wholesaler',
  'lehengas',
  '1000+',
  'quarterly',
  '$25-40 per piece',
  'standard',
  '1-2 months',
  'Export quality packaging with size labels',
  'ISO 9001, WRAP Certification',
  'Bulk export orders for US and European markets. Need scalable production capacity.',
  'In Progress'
);

-- Insert sample stitching partnership applications
INSERT INTO stitching_partnerships (
  unit_name,
  owner_name,
  email,
  phone,
  unit_address,
  city,
  state,
  established_year,
  total_workers,
  machine_capacity,
  monthly_capacity,
  specializations,
  quality_certifications,
  current_clients,
  average_order_value,
  payment_terms,
  working_hours,
  quality_control_process,
  sample_capability,
  business_references,
  status
) VALUES 
(
  'Precision Stitching Works',
  'Meera Nair',
  'meera@precisionstitching.com',
  '+91 94567 89012',
  '789 Industrial Area, Phase 2',
  'Kochi',
  'Kerala',
  2018,
  '26-50',
  '25 sewing machines, 8 overlock, 3 embroidery machines',
  '1000-2000',
  'Blouses, Churidars, Embroidery work',
  'ISO 9001:2015, SEDEX Certification',
  'Local boutiques, 2 export houses',
  '₹50,000-1,00,000',
  '30-70',
  '8 AM - 6 PM, Monday to Saturday',
  '3-stage quality check: cutting, stitching, final inspection',
  'yes',
  'Worked with Fashion Hub Exports for 3 years. Contact: +91 98765 12345',
  'New'
),
(
  'Elite Garment Manufacturing',
  'Suresh Patel',
  'suresh@elitegarments.co.in',
  '+91 91234 56789',
  '321 Textile Park, GIDC',
  'Ahmedabad',
  'Gujarat',
  2015,
  '51-100',
  '40 sewing machines, 12 overlock, 5 embroidery, 2 cutting tables',
  '2000+',
  'Lehengas, Gowns, Bridal wear, Heavy embroidery',
  'WRAP Certification, OEKO-TEX Standard 100',
  'Major fashion brands, Export houses',
  '₹2,00,000-5,00,000',
  '50-50',
  '9 AM - 7 PM, Monday to Saturday, Sunday on demand',
  'Computer-aided quality control with photographic documentation',
  'yes',
  'References: Ethnic Wear Exports (+91 98765 00000), Designer Collections Ltd (+91 87654 11111)',
  'Contacted'
);