根据需求，我将创建一个响应式的紧凑级车试驾数据收集工具的React组件。这个组件将包含车辆信息记录、评分系统、多媒体记录和对比功能。

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Camera, 
  Mic, 
  Plus, 
  Home, 
  BarChart2, 
  Settings, 
  X, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Star,
  Volume2,
  Image,
  FileText,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CarTestDriveApp = () => {
  // 状态管理
  const [activeView, setActiveView] = useState('home');
  const [cars, setCars] = useState([]);
  const [currentCar, setCurrentCar] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('exterior');
  const [selectedCars, setSelectedCars] = useState([]);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  // 加载保存的数据
  useEffect(() => {
    const savedData = localStorage.getItem('carTestDriveData');
    if (savedData) {
      try {
        setCars(JSON.parse(savedData));
      } catch (e) {
        console.error('解析保存的数据失败:', e);
      }
    }
    
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('carTestDriveData', JSON.stringify(cars));
  }, [cars]);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // 创建新车
  const createNewCar = () => {
    const newCar = {
      id: Date.now().toString(),
      basic: {
        brand: '',
        model: '',
        trim: '',
        msrp: '',
        dealerPrice: '',
        testDriveDate: '',
        location: '',
        salesContact: ''
      },
      ratings: {
        exterior: { design: 5, quality: 5, notes: '' },
        interior: { design: 5, quality: 5, comfort: 5, notes: '' },
        space: { front: 5, rear: 5, trunk: 5, notes: '' },
        driving: { power: 5, handling: 5, braking: 5, comfort: 5, notes: '' },
        nvh: { idle: 5, driving: 5, notes: '' },
        smart: { infotainment: 5, assistance: 5, notes: '' }
      },
      advantages: [],
      disadvantages: [],
      overall: { rating: 5, comments: '' },
      photos: [],
      voiceNotes: []
    };
    setCurrentCar(newCar);
    setActiveView('record');
  };

  // 保存车辆记录
  const saveCar = () => {
    if (!currentCar) return;
    
    const existingIndex = cars.findIndex(car => car.id === currentCar.id);
    if (existingIndex >= 0) {
      const updatedCars = [...cars];
      updatedCars[existingIndex] = currentCar;
      setCars(updatedCars);
    } else {
      setCars([...cars, currentCar]);
    }
    
    setActiveView('home');
  };

  // 删除车辆
  const deleteCar = (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setCars(cars.filter(car => car.id !== id));
    }
  };

  // 编辑车辆
  const editCar = (id) => {
    const carToEdit = cars.find(car => car.id === id);
    if (carToEdit) {
      setCurrentCar({...carToEdit});
      setActiveView('record');
    }
  };

  // 拍照功能
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('无法访问摄像头:', err);
      alert('无法访问摄像头，请确保已授予权限');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoPreview(canvas.toDataURL('image/jpeg'));
    }
  };

  const savePhoto = () => {
    if (!photoPreview || !currentCar || !activeTab) return;
    
    const updatedCar = {...currentCar};
    updatedCar.photos = [...updatedCar.photos, {
      category: activeTab,
      dataUrl: photoPreview
    }];
    
    setCurrentCar(updatedCar);
    setPhotoPreview(null);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // 语音记录功能
  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // 更新当前标签的备注
      if (currentCar && activeTab) {
        const updatedCar = {...currentCar};
        updatedCar.ratings[activeTab].notes = finalTranscript || interimTranscript;
        setCurrentCar(updatedCar);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setVoiceRecording(false);
    };
    
    recognition.onend = () => {
      setVoiceRecording(false);
    };
    
    recognition.start();
    setVoiceRecording(true);
    voiceRecognitionRef.current = recognition;
  };

  const stopVoiceRecording = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
    }
    setVoiceRecording(false);
  };

  // 添加优点/缺点
  const addTag = (type, text) => {
    if (!text.trim() || !currentCar) return;
    
    const updatedCar = {...currentCar};
    if (type === 'advantage') {
      updatedCar.advantages = [...updatedCar.advantages, text];
    } else {
      updatedCar.disadvantages = [...updatedCar.disadvantages, text];
    }
    
    setCurrentCar(updatedCar);
  };

  // 删除优点/缺点
  const removeTag = (type, index) => {
    if (!currentCar) return;
    
    const updatedCar = {...currentCar};
    if (type === 'advantage') {
      updatedCar.advantages = updatedCar.advantages.filter((_, i) => i !== index);
    } else {
      updatedCar.disadvantages = updatedCar.disadvantages.filter((_, i) => i !== index);
    }
    
    setCurrentCar(updatedCar);
  };

  // 选择车辆进行对比
  const toggleCarSelection = (id) => {
    setSelectedCars(prev => 
      prev.includes(id) 
        ? prev.filter(carId => carId !== id) 
        : [...prev, id].slice(0, 3) // 最多选择3个
    );
  };

  // 导出数据
  const exportData = () => {
    const dataStr = JSON.stringify(cars, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `car_test_drive_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 主题样式
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-50 text-gray-900';

  const cardClasses = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  const buttonClasses = isDarkMode 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  const secondaryButtonClasses = isDarkMode 
    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800';

  // 评分滑块组件
  const RatingSlider = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block mb-2 font-medium">{label}</label>
      <div className="flex items-center">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="ml-4 w-8 text-center font-bold">{value}</span>
      </div>
    </div>
  );

  // 主视图
  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      {/* 顶部导航 */}
      <header className={`sticky top-0 z-50 p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Car className="mr-2" /> 试驾数据收集
          </h1>
          <div className="flex space-x-2">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-700'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={exportData}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-700'}`}
              title="导出数据"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pb-20">
        {/* 首页视图 */}
        {activeView === 'home' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">我的试驾记录</h2>
              <button
                onClick={createNewCar}
                className={`flex items-center px-4 py-2 rounded-lg ${buttonClasses}`}
              >
                <Plus size={18} className="mr-2" /> 添加新车
              </button>
            </div>

            {cars.length === 0 ? (
              <div className={`p-8 rounded-lg text-center ${cardClasses} border`}>
                <p className="text-lg mb-4">暂无试驾记录</p>
                <button
                  onClick={createNewCar}
                  className={`flex items-center mx-auto px-4 py-2 rounded-lg ${buttonClasses}`}
                >
                  <Plus size={18} className="mr-2" /> 添加第一条记录
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map(car => (
                  <div key={car.id} className={`p-4 rounded-lg border ${cardClasses} shadow-sm`}>
                    <h3 className="text-xl font-semibold mb-2">
                      {car.basic.brand} {car.basic.model}
                    </h3>
                    <p className="text-sm mb-2">
                      {car.basic.testDriveDate && `试驾日期: ${car.basic.testDriveDate}`}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="text-yellow-500 mr-1" />
                        <span className="font-bold">{car.overall.rating}/10</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editCar(car.id)}
                        className={`flex-1 flex items-center justify-center px-3 py-1 rounded ${secondaryButtonClasses}`}
                      >
                        <FileText size={16} className="mr-1" /> 详情
                      </button>
                      <button
                        onClick={() => toggleCarSelection(car.id)}
                        className={`flex-1 flex items-center justify-center px-3 py-1 rounded ${
                          selectedCars.includes(car.id) 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : secondaryButtonClasses
                        }`}
                      >
                        <BarChart2 size={16} className="mr-1" /> 对比
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedCars.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setActiveView('compare')}
                  className={`flex items-center mx-auto px-4 py-2 rounded-lg ${buttonClasses}`}
                >
                  <BarChart2 size={18} className="mr-2" /> 对比选中的车辆 ({selectedCars.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* 记录视图 */}
        {activeView === 'record' && currentCar && (
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setActiveView('home')}
                className={`p-2 mr-4 rounded-full ${secondaryButtonClasses}`}
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold">
                {cars.some(c => c.id === currentCar.id) ? '编辑试驾记录' : '新建试驾记录'}
              </h2>
            </div>

            <div className="mb-6">
              <div className={`p-4 rounded-lg border ${cardClasses} mb-4`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Car className="mr-2" /> 车辆基本信息
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">品牌</label>
                    <input
                      type="text"
                      value={currentCar.basic.brand}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, brand: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 丰田"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">车型</label>
                    <input
                      type="text"
                      value={currentCar.basic.model}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, model: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 卡罗拉"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">配置版本</label>
                    <input
                      type="text"
                      value={currentCar.basic.trim}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, trim: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 1.8L 混动尊享版"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">官方指导价(万元)</label>
                    <input
                      type="number"
                      value={currentCar.basic.msrp}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, msrp: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 15.98"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">实际报价(万元)</label>
                    <input
                      type="number"
                      value={currentCar.basic.dealerPrice}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, dealerPrice: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 14.98"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">试驾日期</label>
                    <input
                      type="date"
                      value={currentCar.basic.testDriveDate}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, testDriveDate: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">试驾地点</label>
                    <input
                      type="text"
                      value={currentCar.basic.location}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, location: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="例如: 北京朝阳4S店"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">销售顾问联系方式</label>
                    <input
                      type="text"
                      value={currentCar.basic.salesContact}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        basic: {...currentCar.basic, salesContact: e.target.value}
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="电话/微信"
                    />
                  </div>
                </div>
              </div>

              {/* 评分标签页 */}
              <div className={`p-4 rounded-lg border ${cardClasses} mb-4`}>
                <h3 className="text-xl font-semibold mb-4">车辆评测</h3>
                
                <div className="flex overflow-x-auto mb-4">
                  {['exterior', 'interior', 'space', 'driving', 'nvh', 'smart'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 mr-2 rounded-t-lg ${
                        activeTab === tab 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-800')
                          : (isDarkMode ? 'bg-gray-700 opacity-70' : 'bg-gray-100')
                      }`}
                    >
                      {{
                        exterior: '外观',
                        interior: '内饰',
                        space: '空间',
                        driving: '驾驶',
                        nvh: '噪音',
                        smart: '智能'
                      }[tab]}
                    </button>
                  ))}
                </div>

                {/* 外观评分 */}
                {activeTab === 'exterior' && (
                  <div>
                    <RatingSlider
                      label="设计感"
                      value={currentCar.ratings.exterior.design}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        ratings: {
                          ...currentCar.ratings,
                          exterior: {
                            ...currentCar.ratings.exterior,
                            design: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <RatingSlider
                      label="做工质量"
                      value={currentCar.ratings.exterior.quality}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        ratings: {
                          ...currentCar.ratings,
                          exterior: {
                            ...currentCar.ratings.exterior,
                            quality: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <div className="mb-4">
                      <label className="block mb-2 font-medium">备注</label>
                      <textarea
                        value={currentCar.ratings.exterior.notes}
                        onChange={(e) => setCurrentCar({
                          ...currentCar,
                          ratings: {
                            ...currentCar.ratings,
                            exterior: {
                              ...currentCar.ratings.exterior,
                              notes: e.target.value
                            }
                          }
                        })}
                        className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        rows="3"
                        placeholder="记录外观方面的观察..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          startCamera();
                          setActiveTab(activeTab);
                        }}
                        className={`flex items-center px-4 py-2 rounded ${secondaryButtonClasses}`}
                      >
                        <Camera size={16} className="mr-2" /> 拍照
                      </button>
                      <button
                        onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                        className={`flex items-center px-4 py-2 rounded ${
                          voiceRecording 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : secondaryButtonClasses
                        }`}
                      >
                        <Mic size={16} className="mr-2" /> 
                        {voiceRecording ? '停止录音' : '语音记录'}
                      </button>
                    </div>
                    {currentCar.photos.filter(p => p.category === 'exterior').length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">已拍照片</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentCar.photos
                            .filter(p => p.category === 'exterior')
                            .map((photo, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={photo.dataUrl} 
                                  alt="外观照片" 
                                  className="w-24 h-24 object-cover rounded border"
                                />
                                <button
                                  onClick={() => {
                                    const updatedCar = {...currentCar};
                                    updatedCar.photos = updatedCar.photos.filter((_, i) => i !== index);
                                    setCurrentCar(updatedCar);
                                  }}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 内饰评分 */}
                {activeTab === 'interior' && (
                  <div>
                    <RatingSlider
                      label="设计感"
                      value={currentCar.ratings.interior.design}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        ratings: {
                          ...currentCar.ratings,
                          interior: {
                            ...currentCar.ratings.interior,
                            design: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <RatingSlider
                      label="材质质感"
                      value={currentCar.ratings.interior.quality}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        ratings: {
                          ...currentCar.ratings,
                          interior: {
                            ...currentCar.ratings.interior,
                            quality: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <RatingSlider
                      label="舒适性"
                      value={currentCar.ratings.interior.comfort}
                      onChange={(e) => setCurrentCar({
                        ...currentCar,
                        ratings: {
                          ...currentCar.ratings,
                          interior: {
                            ...currentCar.ratings.interior,
                            comfort: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <div className="mb-4">
                      <label className="block mb-2 font-medium">备注</label>
                      <textarea
                        value={currentCar.ratings.interior.notes}
                        onChange={(e) => setCurrentCar({
                          ...currentCar,
                          ratings: {
                            ...currentCar.ratings,
                          interior: {
                            ...currentCar.ratings.interior,
                            notes: e.target.value
                          }
                        }
                      })}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      rows="3"
                      placeholder="记录内饰方面的观察..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        startCamera();
                        setActiveTab(activeTab);
                      }}
                      className={`flex items-center px-4 py-2 rounded ${secondaryButtonClasses}`}
                    >
                      <Camera size={16} className="mr-2" /> 拍照
                    </button>
                    <button
                      onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`flex items-center px-4 py-2 rounded ${
                        voiceRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : secondaryButtonClasses
                      }`}
                    >
                      <Mic size={16} className="mr-2" /> 
                      {voiceRecording ? '停止录音' : '语音记录'}
                    </button>
                  </div>
                  {currentCar.photos.filter(p => p.category === 'interior').length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">已拍照片</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentCar.photos
                          .filter(p => p.category === 'interior')
                          .map((photo, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={photo.dataUrl} 
                                alt="内饰照片" 
                                className="w-24 h-24 object-cover rounded border"
                              />
                              <button
                                onClick={() => {
                                  const updatedCar = {...currentCar};
                                  updatedCar.photos = updatedCar.photos.filter((_, i) => i !== index);
                                  setCurrentCar(updatedCar);
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 其他评分标签页... (类似结构) */}

              </div>
            </div>

            {/* 优缺点记录 */}
            <div className={`p-4 rounded-lg border ${cardClasses} mb-4`}>
              <h3 className="text-xl font-semibold mb-4">优缺点记录</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">优点</h4>
                  <div className="mb-2">
                    {currentCar.advantages.map((advantage, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-100 text-green-800 rounded px-3 py-2 mb-2">
                        <span>{advantage}</span>
                        <button
                          onClick={() => removeTag('advantage', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      id="advantageInput"
                      className={`flex-1 p-2 rounded-l border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="添加优点..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag('advantage', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('advantageInput');
                        addTag('advantage', input.value);
                        input.value = '';
                      }}
                      className={`px-4 py-2 rounded-r ${buttonClasses}`}
                    >
                      添加
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-red-600">缺点</h4>
                  <div className="mb-2">
                    {currentCar.disadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-100 text-red-800 rounded px-3 py-2 mb-2">
                        <span>{disadvantage}</span>
                        <button
                          onClick={() => removeTag('disadvantage', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      id="disadvantageInput"
                      className={`flex-1 p-2 rounded-l border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="添加缺点..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag('disadvantage', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('disadvantageInput');
                        addTag('disadvantage', input.value);
                        input.value = '';
                      }}
                      className={`px-4 py-2 rounded-r ${buttonClasses}`}
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 综合评价 */}
            <div className={`p-4 rounded-lg border ${cardClasses} mb-4`}>
              <h3 className="text-xl font-semibold mb-4">综合评价</h3>
              
              <RatingSlider
                label="总体评分"
                value={currentCar.overall.rating}
                onChange={(e) => setCurrentCar({
                  ...currentCar,
                  overall: {
                    ...currentCar.overall,
                    rating: parseInt(e.target.value)
                  }
                })}
              />
              
              <div className="mb-4">
                <label className="block mb-2 font-medium">个人感受与评价</label>
                <textarea
                  value={currentCar.overall.comments}
                  onChange={(e) => setCurrentCar({
                    ...currentCar,
                    overall: {
                      ...currentCar.overall,
                      comments: e.target.value
                    }
                  })}
                  className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  rows="4"
                  placeholder="记录您的整体试驾感受..."
                />
              </div>
              
              <button
                onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                className={`flex items-center px-4 py-2 rounded mr-2 ${
                  voiceRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : secondaryButtonClasses
                }`}
              >
                <Mic size={16} className="mr-2" /> 
                {voiceRecording ? '停止录音' : '语音记录整体感受'}
              </button>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveView('home')}
                className={`px-6 py-2 rounded-lg ${secondaryButtonClasses}`}
              >
                取消
              </button>
              <button
                onClick={saveCar}
                className={`px-6 py-2 rounded-lg ${buttonClasses}`}
              >
                保存记录
              </button>
            </div>
          </div>
        )}

        {/* 对比视图 */}
        {activeView === 'compare' && selectedCars.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setActiveView('home')}
                className={`p-2 mr-4 rounded-full ${secondaryButtonClasses}`}
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold">车辆对比</h2>
            </div>
            
            <div className={`p-4 rounded-lg border ${cardClasses} mb-4`}>
              <h3 className="text-xl font-semibold mb-4">选择对比车辆</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {cars.map(car => (
                  <button
                    key={car.id}
                    onClick={() => toggleCarSelection(car.id)}
                    className={`px-4 py-2 rounded-full ${
                      selectedCars.includes(car.id)
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    {car.basic.brand} {car.basic.model}
                  </button>
                ))}
              </div>
              
              {selectedCars.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <th className="p-3 text-left border">项目</th>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <th key={id} className="p-3 text-left border">
                              {car?.basic.brand} {car?.basic.model}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">官方指导价</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.basic.msrp ? `${car.basic.msrp}万元` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">实际报价</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.basic.dealerPrice ? `${car.basic.dealerPrice}万元` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">外观设计</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.ratings.exterior.design || '-'}/10
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">内饰设计</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.ratings.interior.design || '-'}/10
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">动力表现</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.ratings.driving.power || '-'}/10
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">总体评分</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border font-bold">
                              {car?.overall.rating || '-'}/10
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">优点</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.advantages.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {car.advantages.map((a, i) => (
                                    <li key={i} className="text-green-600">{a}</li>
                                  ))}
                                </ul>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <td className="p-3 border">缺点</td>
                        {selectedCars.map(id => {
                          const car = cars.find(c => c.id === id);
                          return (
                            <td key={id} className="p-3 border">
                              {car?.disadvantages.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {car.disadvantages.map((d, i) => (
                                    <li key={i} className="text-red-600">{d}</li>
                                  ))}
                                </ul>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <footer className={`fixed bottom-0 left-0 right-0 p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
        <div className="flex justify-around">
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'home' ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-800') : ''}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">首页</span>
          </button>
          <button
            onClick={() => {
              setActiveView('compare');
              if (selectedCars.length === 0 && cars.length > 0) {
                setSelectedCars([cars[0].id]);
              }
            }}
            className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'compare' ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-800') : ''}`}
          >
            <BarChart2 size={20} />
            <span className="text-xs mt-1">对比</span>
          </button>
          <button
            onClick={createNewCar}
            className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'record' ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-800') : ''}`}
          >
            <Plus size={20} />
            <span className="text-xs mt-1">添加</span>
          </button>
        </div>
      </footer>

      {/* 拍照模态框 */}
      <AnimatePresence>
        {(cameraActive || photoPreview) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          >
            <div className={`relative p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} w-full max-w-md`}>
              <h3 className="text-xl font-semibold mb-4">拍照记录</h3>
              
              {!photoPreview ? (
                <div>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 bg-black rounded"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <img 
                  src={photoPreview} 
                  alt="预览" 
                  className="w-full h-64 object-contain bg-black rounded"
                />
              )}
              
              <div className="flex justify-center mt-4 space-x-4">
                {!photoPreview ? (
                  <>
                    <button
                      onClick={takePhoto}
                      className={`flex items-center px-4 py-2 rounded-lg ${buttonClasses}`}
                    >
                      <Camera size={18} className="mr-2" /> 拍照
                    </button>
                    <button
                      onClick={stopCamera}
                      className={`flex items-center px-4 py-2 rounded-lg ${secondaryButtonClasses}`}
                    >
                      <X size={18} className="mr-2" /> 取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={savePhoto}
                      className={`flex items-center px-4 py-2 rounded-lg ${buttonClasses}`}
                    >
                      <Check size={18} className="mr-2" /> 保存
                    </button>
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className={`flex items-center px-4 py-2 rounded-lg ${secondaryButtonClasses}`}
                    >
                      <X size={18} className="mr-2" /> 重拍
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 页脚信息 */}
      <div className={`text-center text-xs p-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <p>created by <a href="https://space.coze.cn" className="text-blue-500 hover:underline">coze space</a></p>
        <p>页面内容均由 AI 生成，仅供参考</p>
      </div>
    </div>
  );
};

export default CarTestDriveApp;
```