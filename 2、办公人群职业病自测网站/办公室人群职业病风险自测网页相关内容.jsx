import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Clock, 
  Eye, 
  Heart, 
  HelpCircle, 
  Home, 
  Image, 
  Info, 
  Lightbulb, 
  Monitor, 
  Moon, 
  PieChart, 
  Plus, 
  Settings, 
  Share2, 
  Shield, 
  Smile, 
  Sun, 
  ThumbsUp, 
  TrendingUp, 
  User, 
  Volume2, 
  Wind 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OccupationalHealthTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [riskLevel, setRiskLevel] = useState('');
  const [categoryRisks, setCategoryRisks] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const questions = [
    {
      id: 1,
      type: "singleChoice",
      question: "（单选）您调整座椅高度，使双脚平放地面，大腿与小腿的角度通常是？",
      options: [
        {optionName: "A", optionContent: "约90度"},
        {optionName: "B", optionContent: "大于90度"},
        {optionName: "C", optionContent: "小于90度"},
        {optionName: "D", optionContent: "从不调整座椅高度"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "工效学与姿势"
    },
    {
      id: 2,
      type: "singleChoice",
      question: "（单选）您的屏幕中心高度通常处于？",
      options: [
        {optionName: "A", optionContent: "略低于视线水平"},
        {optionName: "B", optionContent: "与视线水平平齐"},
        {optionName: "C", optionContent: "明显高于视线水平"},
        {optionName: "D", optionContent: "明显低于视线水平"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "工效学与姿势"
    },
    {
      id: 3,
      type: "singleChoice",
      question: "（单选）您使用键盘鼠标时，手腕的姿势是？",
      options: [
        {optionName: "A", optionContent: "自然放松，与手臂基本呈直线"},
        {optionName: "B", optionContent: "稍微弯曲"},
        {optionName: "C", optionContent: "弯曲角度较大"},
        {optionName: "D", optionContent: "经常处于不自然的扭曲状态"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "工效学与姿势"
    },
    {
      id: 4,
      type: "singleChoice",
      question: "（单选）您每次连续坐姿的时长大概是？",
      options: [
        {optionName: "A", optionContent: "不超过1小时"},
        {optionName: "B", optionContent: "1 - 2小时"},
        {optionName: "C", optionContent: "2 - 3小时"},
        {optionName: "D", optionContent: "3小时以上"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "工效学与姿势"
    },
    {
      id: 5,
      type: "singleChoice",
      question: "（单选）您每天观看屏幕的总时长大约是？",
      options: [
        {optionName: "A", optionContent: "小于4小时"},
        {optionName: "B", optionContent: "4 - 6小时"},
        {optionName: "C", optionContent: "6 - 8小时"},
        {optionName: "D", optionContent: "8小时以上"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "视觉健康"
    },
    {
      id: 6,
      type: "singleChoice",
      question: "（单选）您屏幕的亮度设置通常是？",
      options: [
        {optionName: "A", optionContent: "与环境光线协调"},
        {optionName: "B", optionContent: "稍微亮一点"},
        {optionName: "C", optionContent: "明显亮很多"},
        {optionName: "D", optionContent: "经常不调整亮度"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "视觉健康"
    },
    {
      id: 7,
      type: "singleChoice",
      question: "（单选）您眼睛休息的频率大概是？",
      options: [
        {optionName: "A", optionContent: "每20分钟休息一次"},
        {optionName: "B", optionContent: "每1 - 2小时休息一次"},
        {optionName: "C", optionContent: "每2 - 3小时休息一次"},
        {optionName: "D", optionContent: "很少主动休息"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "视觉健康"
    },
    {
      id: 8,
      type: "singleChoice",
      question: "（单选）您是否经常感到眼睛干涩、酸胀、疼痛？",
      options: [
        {optionName: "A", optionContent: "几乎没有"},
        {optionName: "B", optionContent: "偶尔有"},
        {optionName: "C", optionContent: "经常有"},
        {optionName: "D", optionContent: "总是有"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "视觉健康"
    },
    {
      id: 9,
      type: "singleChoice",
      question: "（单选）您目前的工作负荷感觉如何？",
      options: [
        {optionName: "A", optionContent: "比较轻松，能按时完成任务"},
        {optionName: "B", optionContent: "有点压力，但能应对"},
        {optionName: "C", optionContent: "压力很大，经常加班"},
        {optionName: "D", optionContent: "压力极大，难以承受"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "压力管理"
    },
    {
      id: 10,
      type: "singleChoice",
      question: "（单选）您与同事和上级的人际关系如何？",
      options: [
        {optionName: "A", optionContent: "非常融洽，沟通顺畅"},
        {optionName: "B", optionContent: "比较融洽，偶尔有小摩擦"},
        {optionName: "C", optionContent: "时有矛盾，不太和谐"},
        {optionName: "D", optionContent: "关系紧张，经常发生冲突"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "压力管理"
    },
    {
      id: 11,
      type: "singleChoice",
      question: "（单选）您在工作中情绪管理能力如何？",
      options: [
        {optionName: "A", optionContent: "能很好地控制情绪，保持冷静"},
        {optionName: "B", optionContent: "大部分时间能控制情绪"},
        {optionName: "C", optionContent: "情绪容易波动，较难控制"},
        {optionName: "D", optionContent: "经常情绪失控"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "压力管理"
    },
    {
      id: 12,
      type: "singleChoice",
      question: "（单选）您的睡眠质量如何？",
      options: [
        {optionName: "A", optionContent: "很好，入睡快，睡得香"},
        {optionName: "B", optionContent: "一般，偶尔失眠"},
        {optionName: "C", optionContent: "较差，经常失眠"},
        {optionName: "D", optionContent: "非常差，严重影响生活"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "压力管理"
    },
    {
      id: 13,
      type: "singleChoice",
      question: "（单选）您每日的步数大约是？",
      options: [
        {optionName: "A", optionContent: "10000步以上"},
        {optionName: "B", optionContent: "5000 - 10000步"},
        {optionName: "C", optionContent: "2000 - 5000步"},
        {optionName: "D", optionContent: "2000步以下"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "运动与活动"
    },
    {
      id: 14,
      type: "singleChoice",
      question: "（单选）您在工间休息时会进行活动吗？",
      options: [
        {optionName: "A", optionContent: "每次休息都会活动一下"},
        {optionName: "B", optionContent: "偶尔活动一下"},
        {optionName: "C", optionContent: "很少活动"},
        {optionName: "D", optionContent: "从不活动"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "运动与活动"
    },
    {
      id: 15,
      type: "singleChoice",
      question: "（单选）您的饮食习惯如何？",
      options: [
        {optionName: "A", optionContent: "均衡饮食，多吃蔬菜水果"},
        {optionName: "B", optionContent: "基本均衡，偶尔吃垃圾食品"},
        {optionName: "C", optionContent: "经常吃快餐、零食"},
        {optionName: "D", optionContent: "饮食不规律，暴饮暴食"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "运动与活动"
    },
    {
      id: 16,
      type: "singleChoice",
      question: "（单选）您是否有规律的运动习惯？",
      options: [
        {optionName: "A", optionContent: "每周运动3次以上"},
        {optionName: "B", optionContent: "每周运动1 - 2次"},
        {optionName: "C", optionContent: "很少运动"},
        {optionName: "D", optionContent: "从不运动"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "运动与活动"
    },
    {
      id: 17,
      type: "singleChoice",
      question: "（单选）您办公室的照明情况如何？",
      options: [
        {optionName: "A", optionContent: "充足且柔和"},
        {optionName: "B", optionContent: "基本充足"},
        {optionName: "C", optionContent: "较暗或过亮"},
        {optionName: "D", optionContent: "经常闪烁或有阴影"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "办公环境"
    },
    {
      id: 18,
      type: "singleChoice",
      question: "（单选）您办公室的通风情况如何？",
      options: [
        {optionName: "A", optionContent: "良好，空气清新"},
        {optionName: "B", optionContent: "一般，偶尔有异味"},
        {optionName: "C", optionContent: "较差，空气污浊"},
        {optionName: "D", optionContent: "非常差，有明显刺鼻气味"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "办公环境"
    },
    {
      id: 19,
      type: "singleChoice",
      question: "（单选）您办公室的噪音水平如何？",
      options: [
        {optionName: "A", optionContent: "安静，不影响工作"},
        {optionName: "B", optionContent: "有一些噪音，但能接受"},
        {optionName: "C", optionContent: "噪音较大，有点干扰"},
        {optionName: "D", optionContent: "噪音极大，严重影响工作"}
      ],
      answerOrRisk: "A代表低风险，B代表中风险，C和D代表高风险",
      category: "办公环境"
    },
    {
      id: 20,
      type: "multipleChoice",
      question: "（多选）您在工作中是否有以下不良姿势？",
      options: [
        {optionName: "A", optionContent: "弯腰驼背"},
        {optionName: "B", optionContent: "跷二郎腿"},
        {optionName: "C", optionContent: "头部前倾"},
        {optionName: "D", optionContent: "趴在桌子上"}
      ],
      answerOrRisk: "选择的选项越多，风险越高",
      category: "工效学与姿势"
    }
  ];

  const suggestions = {
    "工效学与姿势": [
      "调整你的座椅高度，确保双脚平放地面，大腿与小腿呈90度角。",
      "将显示器屏幕中心调整到略低于视线水平的位置，距离眼睛一臂远。",
      "使用键盘鼠标时，保持手腕自然放松，与手臂基本呈直线，可使用手腕垫辅助。",
      "避免长时间连续坐姿，每工作1小时起身活动5 - 10分钟，做一些伸展运动，如转动颈部、腰部，伸展手臂等。",
      "纠正不良坐姿，如弯腰驼背、跷二郎腿、头部前倾、趴在桌子上，保持挺胸抬头的正确姿势。"
    ],
    "视觉健康": [
      "遵循“20 - 20 - 20”原则：每工作20分钟，看20英尺（约6米）外的物体至少20秒。",
      "确保屏幕亮度与环境光线协调，可根据环境光线调整屏幕亮度，避免眩光，使用防眩光屏幕膜。",
      "增加眼睛休息频率，定时进行眨眼、转动眼球等眼部运动，缓解眼睛疲劳。",
      "如果经常感到眼睛干涩、酸胀、疼痛，可使用人工泪液滋润眼睛，但需遵医嘱。",
      "保持工作环境光线充足且柔和，避免光线直射屏幕。"
    ],
    "压力管理": [
      "尝试进行短暂的冥想或深呼吸练习，每天5 - 10分钟，帮助放松身心，减轻压力。",
      "合理规划工作，制定详细的工作计划和目标，避免长时间过度集中，适当安排休息时间。",
      "与同事和上级保持良好的沟通，及时解决工作中的问题和矛盾，改善人际关系。",
      "培养兴趣爱好，在工作之余做一些自己喜欢的事情，转移注意力，缓解压力。",
      "如果压力过大，可寻求家人、朋友或专业心理咨询师的帮助。"
    ],
    "运动与活动": [
      "利用午休时间散步15 - 20分钟，增加每日步数，促进血液循环。",
      "设置定时提醒，每小时起身活动至少5分钟，进行简单的伸展、走动等活动。",
      "每周进行至少3次，每次30分钟以上的有氧运动，如跑步、游泳、骑自行车等。",
      "参加瑜伽、普拉提等课程，增强身体柔韧性和核心肌群力量。",
      "在工作间隙进行一些简单的健身动作，如深蹲、俯卧撑等。"
    ],
    "办公环境": [
      "如果可能，选择靠近窗户的位置，保证充足的自然光线，也可使用台灯辅助照明。",
      "保持工作区域整洁，减少杂物堆积，定期清理桌面和办公设备。",
      "使用空气净化器或开窗通风，改善办公室空气质量，保持空气清新。",
      "如果办公室噪音较大，可使用耳塞或降噪耳机减少噪音干扰。",
      "合理布置办公家具，避免相互碰撞产生噪音。"
    ]
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = () => {
    let highRiskCount = 0;
    const categoryCounts = {
      "工效学与姿势": 0,
      "视觉健康": 0,
      "压力管理": 0,
      "运动与活动": 0,
      "办公环境": 0
    };

    questions.forEach(q => {
      const answer = answers[q.id];
      if (!answer) return;

      if (q.type === "singleChoice") {
        if (q.answerOrRisk.includes(`${answer}代表高风险`)) {
          highRiskCount++;
          categoryCounts[q.category]++;
        }
      } else if (q.type === "multipleChoice") {
        if (answer.length > 0) {
          highRiskCount += answer.length;
          categoryCounts[q.category] += answer.length;
        }
      }
    });

    let overallRisk;
    if (highRiskCount === 0) {
      overallRisk = '低风险';
    } else if (highRiskCount <= 5) {
      overallRisk = '中风险';
    } else {
      overallRisk = '高风险';
    }

    setRiskLevel(overallRisk);
    setCategoryRisks(categoryCounts);
    setShowResult(true);
  };

  const renderQuestion = (q) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">{q.question}</h3>
        <div className="space-y-3">
          {q.options.map(opt => (
            <div key={opt.optionName} className="flex items-center">
              {q.type === "singleChoice" ? (
                <input
                  type="radio"
                  id={`${q.id}-${opt.optionName}`}
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt.optionName}
                  onChange={() => handleAnswerSelect(q.id, opt.optionName)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="checkbox"
                  id={`${q.id}-${opt.optionName}`}
                  name={`question-${q.id}`}
                  checked={answers[q.id]?.includes(opt.optionName)}
                  onChange={() => {
                    const current = answers[q.id] || [];
                    const newAnswers = current.includes(opt.optionName)
                      ? current.filter(a => a !== opt.optionName)
                      : [...current, opt.optionName];
                    handleAnswerSelect(q.id, newAnswers);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
              )}
              <label htmlFor={`${q.id}-${opt.optionName}`} className="ml-2">
                <span className="font-medium">{opt.optionName}.</span> {opt.optionContent}
              </label>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">{q.answerOrRisk}</p>
      </div>
    );
  };

  const renderResult = () => {
    const chartData = Object.keys(categoryRisks).map(category => ({
      name: category,
      value: categoryRisks[category]
    }));

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">测试结果</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-blue-500" /> 总体风险评估
          </h3>
          <div className={`p-4 rounded-lg ${
            riskLevel === '低风险' ? 'bg-green-100 text-green-800' :
            riskLevel === '中风险' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">您的风险等级: {riskLevel}</span>
              {riskLevel === '低风险' ? (
                <ThumbsUp className="h-6 w-6" />
              ) : riskLevel === '中风险' ? (
                <AlertCircle className="h-6 w-6" />
              ) : (
                <HelpCircle className="h-6 w-6" />
              )}
            </div>
            <p className="mt-2">
              {riskLevel === '低风险' ? 
                '您的职业病风险较低，继续保持良好的工作习惯！' :
                riskLevel === '中风险' ? 
                '您有一些职业病风险因素，建议关注并改善相关方面。' :
                '您的职业病风险较高，建议立即采取措施改善工作环境和习惯。'
              }
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <PieChart className="mr-2 text-blue-500" /> 各分类风险总结
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="高风险项数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            {Object.entries(categoryRisks).map(([category, count]) => (
              <div key={category} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium">{category}</h4>
                <p className={`text-lg font-semibold ${
                  count === 0 ? 'text-green-600' : count <= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {count} 项高风险
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Lightbulb className="mr-2 text-blue-500" /> 改善建议
            </h3>
            <button 
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              {showSuggestions ? '隐藏建议' : '查看建议'} 
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {Object.entries(suggestions).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-lg font-medium mb-3 flex items-center">
                      {category === '工效学与姿势' && <Activity className="mr-2 text-blue-500" />}
                      {category === '视觉健康' && <Eye className="mr-2 text-blue-500" />}
                      {category === '压力管理' && <Heart className="mr-2 text-blue-500" />}
                      {category === '运动与活动' && <TrendingUp className="mr-2 text-blue-500" />}
                      {category === '办公环境' && <Home className="mr-2 text-blue-500" />}
                      {category}
                    </h4>
                    <ul className="space-y-2 pl-5">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-between">
          <button 
            onClick={() => {
              setShowResult(false);
              setCurrentQuestion(0);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            重新测试
          </button>
          <button 
            onClick={() => alert('分享功能将在后续版本中实现')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Share2 className="mr-2 h-4 w-4" /> 分享结果
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">办公室人群职业病风险自测</h1>
          <p className="text-gray-600">评估您的工作环境与习惯，预防职业病的发生</p>
        </div>

        {!showResult ? (
          <div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  问题 {currentQuestion + 1}/{questions.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% 完成
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {renderQuestion(questions[currentQuestion])}

            <div className="flex justify-between mt-6">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 rounded ${currentQuestion === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                上一题
              </button>
              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  下一题 <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitTest}
                  disabled={!answers[questions[currentQuestion].id]}
                  className={`px-4 py-2 rounded flex items-center ${
                    !answers[questions[currentQuestion].id] 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  提交测试 <Check className="ml-2 h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          renderResult()
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>created by <a href="https://space.coze.cn" className="text-blue-600 hover:underline">coze space</a></p>
          <p>页面内容均由 AI 生成，仅供参考</p>
        </div>
      </div>
    </div>
  );
};

export default OccupationalHealthTest;