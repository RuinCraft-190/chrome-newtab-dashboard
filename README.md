# Chrome 新标签页仪表盘

> Vue 3 + TypeScript 开发的 Chrome 浏览器扩展，提供天气显示、自动签到和工作统计功能

## 功能特性

- 🌤️ **天气显示** - 使用和风天气 API 显示实时天气信息（支持 API Key 和 JWT 双认证）
- 💼 **工作统计** - 实时计算今日收入、下班倒计时、发薪日倒计时
- ⚙️ **可配置设置** - 灵活的设置页面，可视化配置所有功能
- 🎨 **现代化界面** - 基于 Vue 3 的响应式设计
- 🔒 **隐私保护** - 所有数据存储在本地，不收集任何个人信息

## 技术栈

- **前端框架**: Vue 3.4 + TypeScript 5.3
- **构建工具**: Vite 5.0
- **扩展插件**: @crxjs/vite-plugin 2.0
- **扩展版本**: Manifest V3
- **天气服务**: 和风天气 V7 API
- **代码规范**: ESLint + Prettier

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
├── public/                      # 静态资源
│   ├── icons/                   # 扩展图标
│   ├── manifest.json           # 扩展配置（构建后）
│   └── jwt-test.html           # JWT 测试工具
├── src/
│   ├── background/              # 后台服务（Service Worker）
│   │   ├── index.ts            # 主入口
│   │   ├── alarms.ts           # 定时签到任务
│   │   ├── storage.ts          # Chrome Storage 封装
│   │   └── weather.ts          # 和风天气 JWT 生成
│   ├── content/                 # 内容脚本
│   │   ├── adapters/           # 签到适配器系统
│   │   │   ├── base.ts         # 适配器基类
│   │   │   ├── registry.ts     # 适配器注册表
│   │   │   ├── pt-site.ts      # PT 站通用适配器
│   │   │   ├── generic.ts      # 通用按钮适配器
│   │   │   └── custom/         # 自定义适配器目录
│   │   └── utils/              # 工具函数（点击、DOM 查询）
│   ├── newtab/                  # 新标签页界面
│   │   ├── components/         # 卡片组件（天气、签到、工作）
│   │   └── styles/             # 全局样式
│   ├── options/                 # 设置页面
│   ├── popup/                   # 弹出窗口
│   └── shared/                  # 共享代码
│       ├── api/                # API 封装
│       ├── types/              # TypeScript 类型定义
│       └── utils/              # 工具函数
├── manifest.config.ts           # Manifest V3 配置源文件
├── .env.example                 # 环境变量模板
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置
└── vite.config.ts               # Vite 构建配置
```

## 开发命令

```bash
npm run dev       # 开发模式（支持热重载）
npm run build     # 生产构建
npm run preview   # 预览构建结果
npm run lint      # 代码检查
npm run lint:fix  # 自动修复代码问题
npm run format    # 代码格式化
```

## 常见问题

### Q: 天气不显示?
A: 请检查以下几点：
1. 是否正确配置了和风天气 API Key 或 JWT
2. 浏览器控制台是否有错误信息
3. 网络连接是否正常
4. API 调用次数是否超限（免费版 1000 次/天）

### Q: 签到不工作?
A: 请按以下步骤排查：
1. 确保已登录目标网站
2. 检查选择器是否正确（使用开发者工具验证）
3. 打开浏览器扩展控制台查看错误日志
4. 尝试手动刷新目标页面后重新签到
5. 检查适配器是否与目标网站匹配

### Q: 如何添加新的签到网站?
A: 有两种方式：
1. **使用通用适配器**：在设置页面添加网站，配置签到按钮选择器
2. **开发自定义适配器**：参考 [src/content/adapters/custom/README.md](src/content/adapters/custom/README.md) 开发专用适配器

### Q: JWT 认证如何配置?
A:
1. 生成 Ed25519 密钥对：`openssl genpkey -algorithm Ed25519 -out ed25519-private.pem`
2. 提取公钥：`openssl pkey -in ed25519-private.pem -pubout -out ed25519-public.pem`
3. 在 `.env` 中配置 API ID 和私钥路径
4. 参考 `public/jwt-test.html` 测试 JWT 生成

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
