import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const IdiomQuiz = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]);

  const quizData = [
    {
      images: [
        'https://s.coze.cn/t/Iw13-BEgYR8/',
        'https://s.coze.cn/t/zxysXknl97M/',
        'https://s.coze.cn/t/RL8YCv-zNsI/',
        'https://s.coze.cn/t/7NDvH2Y6_RQ/'
      ],
      answer: "画龙点睛"
    },
    {
      images: [
        'https://s.coze.cn/t/7ILQBnLuwnY/',
        'https://s.coze.cn/t/P7Ge0bzDp3U/',
        'https://s.coze.cn/t/fR9XrAxVHxs/',
        'https://s.coze.cn/t/NnFwM-KGUXU/'
      ],
      answer: "坐井观天"
    }
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setFlippedCards([false, false, false, false]);
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(quizData.length - 1, prev + 1));
    setFlippedCards([false, false, false, false]);
  };

  const toggleAnswer = () => {
    setFlippedCards(prev => prev.map(() => !prev[0]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col">
      <header className="h-20 flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md">
        <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg">开心猜谜语</h1>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 w-full max-w-4xl">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="relative w-full aspect-square cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => setFlippedCards(prev => {
                const newState = [...prev];
                newState[index] = !newState[index];
                return newState;
              })}
            >
              <div className={`absolute w-full h-full transition-all duration-500 ease-in-out ${flippedCards[index] ? 'opacity-0' : 'opacity-100'}`}>
                <img 
                  src={quizData[currentIndex]?.images?.[index]} 
                  alt={`谜语图片 ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-white"
                />
              </div>
              <div className={`absolute w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold rounded-xl shadow-lg transition-all duration-500 ease-in-out ${flippedCards[index] ? 'opacity-100' : 'opacity-0'}`}>
                {quizData[currentIndex]?.answer}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="bg-white py-4 px-6 shadow-inner">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">题目：{currentIndex + 1}/{quizData.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-1 disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={20} />
                <span>上一题</span>
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIndex === quizData.length - 1}
                className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-1 disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                <span>下一题</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <button 
            onClick={toggleAnswer}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Lightbulb size={20} />
            <span>揭晓答案</span>
          </button>
        </div>
      </footer>

      <div className="py-4 text-center text-sm text-gray-500">
        <a href="https://space.coze.cn" className="hover:text-blue-500">created by coze space</a>
        <span className="mx-2">|</span>
        <span>页面内容均由AI生成，仅供参考</span>
      </div>
    </div>
  );
};

export default IdiomQuiz;