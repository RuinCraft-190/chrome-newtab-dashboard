# Chrome 新标签页仪表盘

> Vue 3 + TypeScript 开发的 Chrome 浏览器扩展，提供天气显示和自动签到功能

## 功能特性

- 🌤️ **天气显示** - 使用和风天气 API 显示实时天气信息
- 📅 **自动签到** - 支持 PT 站和各种网站的自动签到
- ⚙️ **可配置设置** - 灵活的设置页面，支持自定义配置
- 🤖 **适配器系统** - 可扩展的签到适配器，轻松添加新网站
- 🎨 **现代化界面** - 基于 Vue 3 的响应式设计

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **扩展版本**: Manifest V3
- **天气服务**: 和风天气 API

## 安装使用

### 开发模式

1. 克隆项目
```bash
git clone https://github.com/yourusername/chrome-newtab-dashboard.git
cd chrome-newtab-dashboard
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 为 `.env` 并填入你的和风天气 API Key：
```bash
cp .env.example .env
```

4. 启动开发服务器
```bash
npm run dev
```

5. 在 Chrome 中加载扩展
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 目录

### 生产构建

```bash
npm run build
```

构建完成后，在 `chrome://extensions/` 中加载 `dist` 目录。

## 配置说明

### 天气配置

1. 注册和风天气开发者账号: https://dev.qweather.com/
2. 获取 API Key（免费版 1000 次/天）
3. 在扩展设置中填入 API Key 和城市名称

### 签到配置

#### 内置适配器

- **PT 站通用适配器**: 自动识别常见 PT 站并进行签到
- **通用按钮适配器**: 通过配置选择器实现自定义网站签到

#### 添加签到网站

1. 打开扩展设置页面
2. 点击"添加网站"
3. 填写网站信息：
   - 网站名称
   - 网站 URL
   - 适配器类型（PT 站 / 通用）
   - 签到按钮选择器（通用模式需要）
4. 保存配置

#### 查找选择器

1. 打开目标网站
2. 按 F12 打开开发者工具
3. 使用元素选择器找到签到按钮
4. 右键点击按钮 → Copy → Copy selector

## 自定义适配器开发

如果内置适配器无法满足需求，你可以开发自定义适配器。

详细教程请参考: [自定义适配器开发指南](src/content/adapters/custom/README.md)

## 项目结构

```
chrome-newtab-dashboard/
├── public/                 # 静态资源
│   └── manifest.json      # 扩展配置
├── src/
│   ├── background/        # 后台服务
│   ├── content/           # 内容脚本
│   │   └── adapters/      # 签到适配器
│   ├── newtab/            # 新标签页
│   ├── options/           # 设置页面
│   ├── popup/             # 弹出窗口
│   └── shared/            # 共享代码
├── .env.example           # 环境变量模板
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 开发命令

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run lint     # 代码检查
npm run format   # 代码格式化
```

## 常见问题

### Q: 天气不显示?
A: 请检查是否正确配置了和风天气 API Key。

### Q: 签到不工作?
A:
1. 确保已登录目标网站
2. 检查选择器是否正确
3. 打开开发者工具查看错误日志

### Q: 如何添加新的签到网站?
A: 在设置页面中添加网站配置，或开发自定义适配器。

## 隐私政策

本扩展：
- 不收集任何个人信息
- 所有数据存储在本地
- 仅访问用户配置的网站进行签到

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [和风天气](https://www.qweather.com/) - 天气数据支持
- [Vue.js](https://vuejs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
