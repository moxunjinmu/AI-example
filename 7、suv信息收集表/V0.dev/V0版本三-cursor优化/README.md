# 车评家 - 专业的紧凑级车试驾数据收集工具

这是一个用于收集、分析和比较紧凑级车辆试驾数据的Progressive Web App。

## 特点

- 完全响应式设计，适配移动端和桌面端
- 离线可用（PWA支持）
- 黑暗模式支持
- 详细的车辆评分和对比系统
- 数据导出和导入功能
- 高性能和优化的加载速度

## 性能优化

该项目已经过性能优化，主要包括以下方面：

1. **资源优化**
   - 内联关键CSS
   - 外部化非关键JS和CSS
   - 代码拆分和模块化
   - 按需加载非核心依赖

2. **缓存策略**
   - 使用Service Worker实现离线访问
   - 利用缓存控制头设置不同类型资源的缓存时间
   - 实现CDN资源的本地备份

3. **加载优化**
   - 预连接关键域名
   - 延迟加载非关键资源
   - 优先加载首屏内容
   - 启用Gzip压缩

4. **渲染优化**
   - 最小化重绘和回流
   - 使用CSS动画替代JavaScript动画
   - 实现平滑的UI过渡效果

## 部署说明

1. 将所有文件上传到支持HTTPS的Web服务器
2. 确保服务器配置支持PWA（如`.htaccess`文件中的设置）
3. 验证Service Worker是否正确注册和工作
4. 检查缓存策略是否按预期工作

## 文件结构

```
/
│
├── css/                  # 样式文件
│   └── styles.css        # 非关键CSS
│
├── js/                   # JavaScript文件
│   ├── app.js            # 主应用逻辑
│   ├── forms.js          # 表单处理
│   ├── service-worker-registration.js  # Service Worker注册
│   ├── views.js          # 视图渲染
│   └── libs/             # 本地库文件备份
│       └── jquery.min.js # jQuery本地备份
│
├── icons/                # 应用图标
│   └── placeholder.svg   # 占位图标
│
├── .htaccess             # 服务器配置（Apache）
├── index.html            # 主HTML文件
├── manifest.json         # PWA配置
└── service-worker.js     # Service Worker
```

## 开发指南

### 本地开发

1. 克隆仓库到本地
2. 使用本地服务器运行（如Live Server, http-server等）
3. 对`index.html`文件进行任何页面结构更改
4. 将新的CSS样式添加到`css/styles.css`中
5. 在`js/`目录下相应的文件中添加JavaScript功能

### 添加新功能

1. 遵循现有的模块化结构
2. 在`views.js`中添加新的视图渲染函数
3. 在`forms.js`中添加新的表单处理逻辑
4. 更新`app.js`中的应用状态和导航逻辑
5. 如有必要，更新`service-worker.js`中的缓存资源列表

### 部署前检查

1. 验证所有链接和功能是否正常工作
2. 检查响应式设计在不同设备上的表现
3. 确认离线功能是否正常
4. 验证黑暗模式切换是否正常
5. 测试数据导入/导出功能

## 许可

该项目采用MIT许可证。 