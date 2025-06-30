import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Pencil, 
  Trash2, 
  Heart, 
  Share2, 
  ShoppingBag, 
  ChevronLeft,
  Search,
  Filter,
  Sparkles,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserSavedDesigns } from '../lib/ai-stylist';

const SavedDesigns: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login', { state: { returnTo: '/saved-designs' } });
        return;
      }
      
      setUser(user);
      fetchDesigns(user.id);
    };
    
    checkUser();
  }, [navigate]);

  const fetchDesigns = async (userId: string) => {
    setLoading(true);
    const designs = await getUserSavedDesigns(userId);
    setDesigns(designs);
    setLoading(false);
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    
    try {
      const { error } = await supabase
        .from('saved_designs')
        .delete()
        .eq('id', designId);
        
      if (error) throw error;
      
      // Update local state
      setDesigns(designs.filter(design => design.id !== designId));
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design. Please try again.');
    }
  };

  const handleToggleFavorite = async (designId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_designs')
        .update({ is_favorite: !currentStatus })
        .eq('id', designId);
        
      if (error) throw error;
      
      // Update local state
      setDesigns(designs.map(design => 
        design.id === designId 
          ? { ...design, is_favorite: !currentStatus } 
          : design
      ));
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleShareDesign = async (designId: string, shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared-design/${shareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert(`Share this link: ${shareUrl}`);
    }
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.design_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.garment_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'favorites' && design.is_favorite) ||
                         (filterType === design.garment_type);
    
    return matchesSearch && matchesFilter;
  });

  const garmentTypes = [...new Set(designs.map(design => design.garment_type))];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">My Saved Designs</h1>
            </div>
            <p className="text-gray-600">
              {designs.length} {designs.length === 1 ? 'design' : 'designs'} saved
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/ai-stylist"
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create New Design</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Designs</option>
                <option value="favorites">Favorites</option>
                {garmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No designs found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all'
                ? "No designs match your search criteria. Try adjusting your filters."
                : "You haven't saved any designs yet. Start creating with our AI Stylist!"}
            </p>
            <Link
              to="/ai-stylist"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Your First Design</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <div key={design.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="aspect-square bg-gray-100 relative">
                  {/* Design Preview Image */}
                  {design.preview_image_url ? (
                    <img
                      src={design.preview_image_url}
                      alt={design.design_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {design.garment_type === 'blouse' && (
                        <img 
                          src="https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Blouse" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {design.garment_type === 'lehenga' && (
                        <img 
                          src="https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Lehenga" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {design.garment_type === 'saree' && (
                        <img 
                          src="https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Saree" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {design.garment_type === 'dress' && (
                        <img 
                          src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300" 
                          alt="Dress" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {!['blouse', 'lehenga', 'saree', 'dress'].includes(design.garment_type) && (
                        <Sparkles className="w-16 h-16 text-gray-300" />
                      )}
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(design.id, design.is_favorite)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      design.is_favorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-500 hover:text-red-500'
                    } shadow-md transition-colors`}
                  >
                    <Heart className="w-5 h-5" fill={design.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{design.design_name}</h3>
                  <p className="text-sm text-gray-600 mb-3 capitalize">{design.garment_type}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {design.fabric_details?.type && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full capitalize">
                        {design.fabric_details.type}
                      </span>
                    )}
                    {design.fabric_details?.color && (
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full capitalize">
                        {design.fabric_details.color}
                      </span>
                    )}
                    {design.style_elements?.neckline && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                        {design.style_elements.neckline}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {new Date(design.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleShareDesign(design.id, design.share_token)}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                        title="Share Design"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/design/${design.id}`}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                        title="View Design"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete Design"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/order/new?designId=${design.id}`}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Create Order</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export both as named export and default export
export { SavedDesigns };
export default SavedDesigns;