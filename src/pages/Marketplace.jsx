import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Crown, Package, Plus, X, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMarketplaceListings, createMarketplaceListing } from '../utils/firebase';

const rose = '#f43f5e';
const glass = { background: 'rgba(10,7,20,0.85)', border: '1px solid rgba(244,63,94,0.12)' };
const fieldStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.12)',
  borderRadius: 14, color: '#e2d9f3', outline: 'none',
  width: '100%', padding: '12px 16px', fontSize: 14,
};

const ListingCard = ({ listing }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
    className="rounded-3xl overflow-hidden group transition-all" style={glass}>
    <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
      {listing.imageUrl
        ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className="flex flex-col items-center gap-2 text-slate-700">
          <Package size={40} />
          <span className="text-xs">No image</span>
        </div>
      }
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,7,20,0.8) 0%, transparent 60%)' }} />
      <div className="absolute top-3 left-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium capitalize"
          style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>
          {listing.category || 'merchandise'}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-white mb-1">{listing.title}</h3>
      <p className="text-xs text-slate-600 line-clamp-2 mb-4">{listing.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign size={16} style={{ color: '#22c55e' }} />
          <span className="font-black text-lg" style={{ color: '#22c55e' }}>{listing.price}</span>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="px-4 py-2 rounded-xl font-medium text-xs transition-all"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
          View Details
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const Marketplace = () => {
  const { userProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: 'merchandise', imageUrl: '' });

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await getMarketplaceListings();
    setListings(data);
    setLoading(false);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!userProfile?.isPremium) { alert('Premium membership required to create listings'); return; }
    await createMarketplaceListing(userProfile.id, formData);
    setFormData({ title: '', description: '', price: '', category: 'merchandise', imageUrl: '' });
    setShowCreateForm(false);
    loadListings();
  };

  const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  /* premium gate */
  if (!userProfile?.isPremium) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-[#050505]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-12 text-center max-w-md" style={{ ...glass, boxShadow: '0 0 40px rgba(244,63,94,0.1)' }}>
          <Crown size={56} className="mx-auto mb-5" style={{ color: rose }} />
          <h2 className="font-black text-white mb-3" style={{ fontFamily: 'var(--font-display,Cinzel,serif)', fontSize: '1.8rem' }}>Premium Only</h2>
          <p className="text-slate-600 text-sm mb-7 max-w-xs mx-auto">The Marketplace is exclusive to premium members. Upgrade to access anime collectibles trading.</p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 20px rgba(244,63,94,0.35)' }}>
            Upgrade to Premium
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 relative bg-[#050505]">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px]" style={{ background: 'radial-gradient(circle,rgba(244,63,94,0.04),transparent 70%)', filter: 'blur(80px)' }} />
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <p className="text-xs tracking-[0.5em] mb-3" style={{ color: 'rgba(244,114,182,0.3)', fontFamily: '"Noto Sans JP",sans-serif' }}>蒐集・交易</p>
          <h1 className="font-black mb-2" style={{ fontFamily: 'var(--font-display,Cinzel,serif)', fontSize: 'clamp(2.2rem,5vw,4rem)', color: '#e2d9f3' }}>
            <span style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Anime</span>
            {' '}Marketplace
          </h1>
          <p className="text-slate-600 text-sm">Trade premium anime collectibles & merchandise</p>
        </div>

        {/* Create button */}
        <div className="flex justify-end mb-6">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2"
            style={showCreateForm
              ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }
              : { background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: '#fff', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
            {showCreateForm ? <><X size={15} />Cancel</> : <><Plus size={15} />Create Listing</>}
          </motion.button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="p-6 rounded-3xl mb-8" style={{ ...glass, border: '1px solid rgba(244,63,94,0.2)' }}>
              <h3 className="font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display,Cinzel,serif)' }}>New Listing</h3>
              <form onSubmit={handleCreateListing} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Title *</label>
                  <input type="text" required placeholder="Item name" value={formData.title}
                    onChange={e => setField('title', e.target.value)} style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Price (USD) *</label>
                  <input type="number" required placeholder="0.00" value={formData.price}
                    onChange={e => setField('price', e.target.value)} style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Description *</label>
                  <textarea required rows={3} placeholder="Describe your item..." value={formData.description}
                    onChange={e => setField('description', e.target.value)}
                    style={{ ...fieldStyle, resize: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Image URL</label>
                  <input type="url" placeholder="https://..." value={formData.imageUrl}
                    onChange={e => setField('imageUrl', e.target.value)} style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(244,63,94,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(244,63,94,0.12)'} />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 uppercase tracking-widest mb-2">Category</label>
                  <select value={formData.category} onChange={e => setField('category', e.target.value)}
                    style={{ ...fieldStyle }}>
                    {['merchandise', 'figures', 'art', 'other'].map(c => (
                      <option key={c} value={c} style={{ background: '#05030c' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
                    Publish Listing
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listings grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(244,63,94,0.2)', borderTopColor: rose }} />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-600 mb-2 text-sm">No listings yet</p>
            <p className="text-slate-700 text-xs">Be the first to list an item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
