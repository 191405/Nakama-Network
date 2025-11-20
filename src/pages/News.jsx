import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Calendar, Eye } from 'lucide-react';
import { getAnimeNews } from '../utils/firebase';

const News = () => {
  const [news, setNews] = useState([]);

  const sampleNews = [
    {
      id: '1',
      title: 'Attack on Titan Final Season Part 3 Confirmed',
      content: 'The epic saga continues with confirmation of the final part releasing in 2024...',
      image: 'https://img.youtube.com/vi/SlNpRThS9t8/maxresdefault.jpg',
      publishedAt: { toDate: () => new Date('2024-01-15') },
      category: 'announcement',
      views: 15420
    },
    {
      id: '2',
      title: 'Demon Slayer Movie Breaks Box Office Records',
      content: 'The latest Demon Slayer film has shattered expectations worldwide...',
      image: 'https://img.youtube.com/vi/6vMuWuWlW4I/maxresdefault.jpg',
      publishedAt: { toDate: () => new Date('2024-01-14') },
      category: 'box-office',
      views: 12890
    },
    {
      id: '3',
      title: 'Jujutsu Kaisen Season 3 Announcement Coming Soon',
      content: 'Sources close to MAPPA suggest a major announcement is imminent...',
      image: 'https://img.youtube.com/vi/O6qVieflwqs/maxresdefault.jpg',
      publishedAt: { toDate: () => new Date('2024-01-13') },
      category: 'rumor',
      views: 18650
    },
    {
      id: '4',
      title: 'New Isekai Anime Takes Internet by Storm',
      content: 'A surprise hit has emerged from this season\'s lineup...',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      publishedAt: { toDate: () => new Date('2024-01-12') },
      category: 'trending',
      views: 9230
    },
    {
      id: '5',
      title: 'Crunchyroll Announces New Simulcast Lineup',
      content: 'Get ready for an exciting season of anime streaming...',
      image: 'https://images.unsplash.com/photo-1618945524163-32451704a253?w=800',
      publishedAt: { toDate: () => new Date('2024-01-11') },
      category: 'streaming',
      views: 7840
    },
    {
      id: '6',
      title: 'Top 10 Most Anticipated Anime of 2024',
      content: 'From shounen powerhouses to slice-of-life gems, here\'s what to watch...',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
      publishedAt: { toDate: () => new Date('2024-01-10') },
      category: 'ranking',
      views: 21340
    }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const newsData = await getAnimeNews();
      setNews(newsData.length > 0 ? newsData : sampleNews);
    } catch (error) {
      console.error('Error loading news:', error);
      setNews(sampleNews);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'announcement': 'text-blue-400 bg-blue-400/20 border-blue-400/50',
      'box-office': 'text-green-400 bg-green-400/20 border-green-400/50',
      'rumor': 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50',
      'trending': 'text-pink-400 bg-pink-400/20 border-pink-400/50',
      'streaming': 'text-purple-400 bg-purple-400/20 border-purple-400/50',
      'ranking': 'text-orange-400 bg-orange-400/20 border-orange-400/50',
    };
    return colors[category] || 'text-gray-400 bg-gray-400/20 border-gray-400/50';
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Anime News</span>
          </h1>
          <p className="text-gray-400 font-mono">Latest Updates from the Anime Community</p>
        </motion.div>

        {/* Featured News */}
        {news.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl overflow-hidden mb-8 hover-lift border border-neon-blue/30">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-video md:aspect-auto">
                <img src={news[0].image} alt={news[0].title} className="w-full h-full object-cover"/>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(news[0].category)}`}>
                    FEATURED
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block w-fit mb-3 ${getCategoryColor(news[0].category)}`}>
                  {news[0].category.toUpperCase()}
                </span>
                <h2 className="text-3xl font-bold mb-4">{news[0].title}</h2>
                <p className="text-gray-400 mb-4 leading-relaxed">{news[0].content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{news[0].publishedAt.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{news[0].views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(1).map((article, idx) => (
            <motion.div key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden hover-lift border border-neon-purple/30 cursor-pointer">
              <div className="relative aspect-video bg-void-gray">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover"/>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{article.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{article.publishedAt.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="mx-auto mb-4 text-gray-600" size={64} />
            <p className="text-gray-400">No news available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
