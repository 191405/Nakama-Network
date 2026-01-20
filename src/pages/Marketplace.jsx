import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Crown, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMarketplaceListings, createMarketplaceListing } from '../utils/firebase';

const Marketplace = () => {
  const { userProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'merchandise',
    imageUrl: ''
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const data = await getMarketplaceListings();
    setListings(data);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!userProfile?.isPremium) {
      alert('Premium membership required to create listings');
      return;
    }

    await createMarketplaceListing(userProfile.id, formData);
    setFormData({ title: '', description: '', price: '', category: 'merchandise', imageUrl: '' });
    setShowCreateForm(false);
    loadListings();
  };

  if (!userProfile?.isPremium) {
    return (
      <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 flex items-center justify-center relative z-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-12 text-center border border-yellow-500/30 max-w-md">
          <Crown className="mx-auto mb-6 text-yellow-400" size={64} />
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">Premium Only</h2>
          <p className="text-gray-400 mb-6">The Marketplace is exclusive to premium users. Upgrade to access anime merchandise trading!</p>
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-bold text-black cyber-button">
            Upgrade to Premium
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 opacity-100">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Marketplace</span>
          </h1>
          <p className="text-gray-400 font-mono">Trade Anime Merchandise & Collectibles</p>
        </div>

        <div className="flex justify-end mb-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold cyber-button">
            {showCreateForm ? 'Cancel' : 'Create Listing'}
          </motion.button>
        </div>

        {showCreateForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 mb-6 border border-neon-blue/30">
            <h3 className="text-xl font-bold mb-4">New Listing</h3>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <input type="text" placeholder="Title" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none" />
              <textarea placeholder="Description" required rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none" />
              <input type="number" placeholder="Price (USD)" required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none" />
              <input type="url" placeholder="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none" />
              <select value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-void-gray border border-neon-blue/30 rounded-xl focus:border-neon-blue outline-none">
                <option value="merchandise">Merchandise</option>
                <option value="figures">Figures</option>
                <option value="art">Art</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold cyber-button">
                Create Listing
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, idx) => (
            <motion.div key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden hover-lift border border-neon-blue/30">
              <div className="aspect-video bg-void-gray flex items-center justify-center">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="text-gray-600" size={64} />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-green-400" size={20} />
                    <span className="text-xl font-bold text-green-400">{listing.price}</span>
                  </div>
                  <button className="px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 rounded-lg text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {listings.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto mb-4 text-gray-600" size={64} />
            <p className="text-gray-400">No listings yet. Be the first to sell!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
