import { motion, AnimatePresence } from 'framer-motion';
import { Book, Scale, Coins, Globe, Users, History, Lightbulb, ChevronDown, ChevronUp, Search, X, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { LIBRARY_DATA, LibraryItem, LibraryCategory } from '@/data/library';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';

export default function Library() {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'concept' | 'book' | 'figure'>('all');

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const filteredData = useMemo(() => {
        return LIBRARY_DATA.filter(cat => {
            if (activeTab !== 'all' && cat.type !== activeTab) return false;
            
            // If searching, check if category title or any item matches
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const catMatch = cat.title.toLowerCase().includes(query);
                const itemsMatch = cat.items.some(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.desc.toLowerCase().includes(query)
                );
                return catMatch || itemsMatch;
            }
            return true;
        }).map(cat => {
            // Filter items inside category if searching
            if (searchQuery.trim()) {
                 const query = searchQuery.toLowerCase();
                 const filteredItems = cat.items.filter(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.desc.toLowerCase().includes(query) ||
                    cat.title.toLowerCase().includes(query)
                 );
                 return { ...cat, items: filteredItems };
            }
            return cat;
        });
    }, [searchQuery, activeTab]);

    return (
        <div className="flex h-full bg-gray-50 overflow-hidden font-sans relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                                Thư viện <span className="text-soviet-red-700">Triết học</span>
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                                Kho tàng kiến thức nền tảng về Chủ nghĩa Mác - Lênin, Tư tưởng Hồ Chí Minh và các giá trị cốt lõi.
                            </p>

                            {/* Search & Filter */}
                            <div className="max-w-xl mx-auto space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="search-library"
                                        id="search-library"
                                        autoComplete="off"
                                        placeholder="Tìm kiếm khái niệm, tác phẩm, nhân vật..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-soviet-red-500 focus:border-transparent shadow-sm transition-all group-hover:shadow-md"
                                    />
                                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-soviet-red-500 transition-colors" />
                                </div>

                                <div className="flex justify-center space-x-2">
                                    {[
                                        { id: 'all', label: 'Tất cả' },
                                        { id: 'concept', label: 'Khái niệm' },
                                        { id: 'book', label: 'Tác phẩm' },
                                        { id: 'figure', label: 'Nhân vật' }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={clsx(
                                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                                activeTab === tab.id
                                                    ? "bg-soviet-red-700 text-white shadow-md transform scale-105"
                                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-soviet-red-200"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                        <AnimatePresence>
                            {filteredData.map((category, idx) => (
                                category.items.length > 0 && (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow h-fit"
                                >
                                    <div 
                                        onClick={() => toggleCategory(category.id)}
                                        className={`p-6 cursor-pointer bg-gradient-to-r ${category.color} text-white flex items-center justify-between group`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                                <category.icon className="h-6 w-6" />
                                            </div>
                                            <h2 className="text-xl font-bold font-serif tracking-wide">{category.title}</h2>
                                        </div>
                                        {expandedCategory === category.id || searchQuery ? (
                                            <ChevronUp className="h-6 w-6" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6" />
                                        )}
                                    </div>
                                    
                                    <motion.div
                                        initial={false}
                                        animate={{ height: (expandedCategory === category.id || searchQuery) ? 'auto' : 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 space-y-3 bg-white">
                                            {category.items.map((item, itemIdx) => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => setSelectedItem(item)}
                                                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-soviet-red-50 hover:border-soviet-red-100 transition-all cursor-pointer group flex space-x-4 hover:shadow-sm"
                                                >
                                                    {item.image && (
                                                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 border border-gray-200 group-hover:border-soviet-red-200 transition-colors">
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.title} 
                                                                referrerPolicy="no-referrer"
                                                                crossOrigin="anonymous"
                                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                                onError={(e) => {
                                                                    // Fallback image if Unsplash/Wikimedia fails
                                                                    e.currentTarget.src = "https://placehold.co/600x400/8B0000/FFFFFF?text=Triet+Hoc";
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-bold text-gray-900 flex items-center group-hover:text-soviet-red-800 transition-colors truncate pr-2">
                                                                {category.type === 'figure' ? <Users className="h-4 w-4 text-soviet-gold-500 mr-2 flex-shrink-0" /> :
                                                                 category.type === 'book' ? <BookOpen className="h-4 w-4 text-soviet-gold-500 mr-2 flex-shrink-0" /> :
                                                                 <Lightbulb className="h-4 w-4 text-soviet-gold-500 mr-2 flex-shrink-0" />}
                                                                <span className="truncate">{item.title}</span>
                                                            </h3>
                                                            {(item.year || item.author) && (
                                                                <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 flex-shrink-0">
                                                                    {item.year || item.author}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center text-gray-300 group-hover:text-soviet-red-400 transition-colors">
                                                        <ArrowRight className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredData.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Không tìm thấy kết quả phù hợp.</p>
                        </div>
                    )}

                    {/* Footer Quote */}
                    <div className="mt-8 text-center border-t border-gray-200 pt-12">
                        <blockquote className="font-serif text-2xl italic text-gray-500 max-w-3xl mx-auto">
                            "Không có lý luận cách mạng thì không thể có phong trào cách mạng."
                        </blockquote>
                        <p className="mt-4 font-bold text-soviet-red-700 uppercase tracking-widest text-sm">— V.I. Lenin</p>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-20">
                                <div className="pr-8">
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-soviet-red-800 mb-2 leading-tight">
                                        {selectedItem.title}
                                    </h2>
                                    {(selectedItem.author || selectedItem.year) && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
                                            {selectedItem.author && <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{selectedItem.author}</span>}
                                            {selectedItem.author && selectedItem.year && <span className="text-gray-400">•</span>}
                                            {selectedItem.year && <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{selectedItem.year}</span>}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                {selectedItem.image && (
                                    <div className="w-full h-64 md:h-80 relative">
                                        <img 
                                            src={selectedItem.image} 
                                            alt={selectedItem.title} 
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://placehold.co/600x400/8B0000/FFFFFF?text=Triet+Hoc";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </div>
                                )}
                                
                                <div className="p-6 md:p-8">
                                    <p className="text-lg md:text-xl text-gray-700 font-medium mb-8 italic border-l-4 border-soviet-gold-500 pl-6 bg-yellow-50 py-4 rounded-r-lg">
                                        {selectedItem.desc}
                                    </p>
                                    
                                    <div className="prose prose-red prose-lg max-w-none font-sans text-gray-800 leading-loose">
                                        <ReactMarkdown>
                                            {selectedItem.content || "Nội dung chi tiết đang được cập nhật..."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-6 py-2.5 bg-soviet-red-700 text-white rounded-xl text-sm font-medium hover:bg-soviet-red-800 shadow-md transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Đóng
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
