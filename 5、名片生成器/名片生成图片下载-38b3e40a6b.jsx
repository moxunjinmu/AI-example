import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Info, Gift, Heart, Link, Download, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';

const BusinessCardGenerator = () => {
  const [cardData, setCardData] = useState({
    nickname: 'DigitalNomad',
    location: '23.12°N, 113.25°E',
    bio: '全栈创意开发者 × AI技术探索者',
    offer: 'Next.js开发/提示词工程/AIGC工作流设计',
    need: 'Web3应用场景/分布式协作机会',
    links: 'coze.space/portfolio'
  });

  const [activeModules, setActiveModules] = useState({
    nickname: true,
    location: true,
    bio: true,
    offer: true,
    need: true,
    links: true
  });

  const [theme, setTheme] = useState('paper');
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageFormat, setImageFormat] = useState('PNG (300dpi)');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const cardPreviewRef = useRef(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardPreviewRef.current, {
        scale: imageFormat.includes('300dpi') ? 3 : 2,
        useCORS: true,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `business-card_${Date.now()}.${imageFormat.includes('JPG') ? 'jpg' : 'png'}`;
      link.href = canvas.toDataURL(`image/${imageFormat.includes('JPG') ? 'jpeg' : 'png'}`);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('生成失败，请检查内容后重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'paper':
        return {
          card: 'bg-[#F5F5DC] border-[#A0522D] text-[#5C4033]',
          title: 'text-[#8B4513]',
          divider: 'border-[#A0522D]',
          icon: 'text-[#8B4513]'
        };
      case 'blackGold':
        return {
          card: 'bg-gradient-to-br from-black to-[#1a1a1a] text-[#FFD700]',
          title: 'text-[#FFD700]',
          divider: 'border-[#FFD700]',
          icon: 'text-[#FFD700]'
        };
      case 'cyberpunk':
        return {
          card: 'bg-gradient-to-br from-[#000428] to-[#004e92] text-[#00F0FF]',
          title: 'text-[#FF003C]',
          divider: 'border-[#00F0FF]',
          icon: 'text-[#FF003C]'
        };
      default:
        return {
          card: 'bg-white border-gray-300 text-gray-800',
          title: 'text-blue-600',
          divider: 'border-gray-300',
          icon: 'text-gray-600'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className="min-h-screen bg-[#F6F8FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 配置面板 */}
        <div className="bg-white rounded-xl shadow-md border border-[#E5E7EB] p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">名片配置</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* 左侧内容配置区 */}
            <div className="w-full md:w-3/5">
              {[
                { id: 'nickname', label: '昵称', icon: <User size={18} /> },
                { id: 'location', label: '坐标', icon: <MapPin size={18} /> },
                { id: 'bio', label: '自我介绍', icon: <Info size={18} /> },
                { id: 'offer', label: '我能提供', icon: <Gift size={18} /> },
                { id: 'need', label: '我需要', icon: <Heart size={18} /> },
                { id: 'links', label: '资源链接', icon: <Link size={18} /> }
              ].map((item) => (
                <div key={item.id} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </label>
                    <button
                      onClick={() => toggleModule(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeModules[item.id] ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activeModules[item.id] ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <textarea
                    value={cardData[item.id]}
                    onChange={(e) => setCardData({...cardData, [item.id]: e.target.value})}
                    className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`输入${item.label}...`}
                  />
                </div>
              ))}
            </div>

            {/* 右侧风格选择区 */}
            <div className="w-full md:w-2/5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">选择名片风格</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'paper', name: '纸张风格' },
                  { id: 'blackGold', name: '黑金风格' },
                  { id: 'cyberpunk', name: '赛博朋克' }
                ].map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(t.id)}
                    className={`h-40 rounded-lg cursor-pointer overflow-hidden relative ${theme === t.id ? 'ring-4 ring-blue-500' : ''}`}
                  >
                    <div className={`absolute inset-0 ${getThemeStyles(t.id).card} opacity-70`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 下载功能栏 */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#F8FAFD] p-4 rounded-lg mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <h3 className="text-sm font-medium text-gray-700 mr-4">分享名片</h3>
            <div className="relative">
              <button 
                className="flex items-center justify-between px-3 py-2 bg-white border border-[#CED6E0] rounded-md w-40"
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              >
                <span className="text-sm">{imageFormat}</span>
                <ChevronDown size={16} className="ml-2" />
              </button>
              {showFormatDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-[#CED6E0]"
                >
                  {['PNG (300dpi)', 'PNG (150dpi)', 'JPG (85质量)'].map(format => (
                    <div 
                      key={format}
                      className="px-3 py-2 text-sm hover:bg-[#F0F4F9] cursor-pointer"
                      onClick={() => {
                        setImageFormat(format);
                        setShowFormatDropdown(false);
                      }}
                    >
                      {format}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center px-6 py-2 bg-[#4D90F9] text-white rounded-md w-full md:w-auto"
          >
            {isDownloading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Download size={16} className="mr-2" />
            )}
            下载分享图
          </motion.button>
        </div>

        {/* 名片预览区 */}
        <div className="flex justify-center">
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-md rounded-2xl shadow-xl border-2 ${themeStyles.card} ${themeStyles.divider} p-8 min-h-[600px] flex flex-col`}
            ref={cardPreviewRef}
            id="card-preview"
          >
            {activeModules.nickname && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <h1 className={`text-2xl font-bold ${themeStyles.title}`}>
                  {cardData.nickname}
                </h1>
              </motion.div>
            )}

            {activeModules.location && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 flex items-center"
              >
                <MapPin className={`mr-2 ${themeStyles.icon}`} />
                <p>{cardData.location}</p>
              </motion.div>
            )}

            {activeModules.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className={`flex items-center mb-2 ${themeStyles.title}`}>
                  <Info className={`mr-2 ${themeStyles.icon}`} />
                  <h2 className="font-medium">自我介绍</h2>
                </div>
                <p>{cardData.bio}</p>
              </motion.div>
            )}

            {activeModules.offer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className={`flex items-center mb-2 ${themeStyles.title}`}>
                  <Gift className={`mr-2 ${themeStyles.icon}`} />
                  <h2 className="font-medium">我能提供</h2>
                </div>
                <p>{cardData.offer}</p>
              </motion.div>
            )}

            {activeModules.need && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className={`flex items-center mb-2 ${themeStyles.title}`}>
                  <Heart className={`mr-2 ${themeStyles.icon}`} />
                  <h2 className="font-medium">我需要</h2>
                </div>
                <p>{cardData.need}</p>
              </motion.div>
            )}

            {activeModules.links && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-auto"
              >
                <div className={`flex items-center mb-2 ${themeStyles.title}`}>
                  <Link className={`mr-2 ${themeStyles.icon}`} />
                  <h2 className="font-medium">资源链接</h2>
                </div>
                <a 
                  href={`https://${cardData.links}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {cardData.links}
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-12 py-4 border-t border-[#D1D5DB] bg-[#E5E7EB]">
        <div className="text-center text-xs text-[#6B7280] space-y-1">
          <p>created by <a href="https://space.coze.cn" className="text-[#4D90F9] hover:underline">coze space</a></p>
          <p>页面内容均由 AI 生成，仅供参考</p>
          <p>图片生成基于html2canvas实现</p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessCardGenerator;