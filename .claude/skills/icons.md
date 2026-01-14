---
description: 创建扩展图标
---

为 Chrome 扩展创建图标文件。

要求：
- 3 种尺寸：16x16, 48x48, 128x128 像素
- PNG 格式
- 建议使用透明背景

创建方法：

方法1：使用在线工具
1. 访问 https://www.favicon-generator.org/ 或类似网站
2. 上传一个正方形图片
3. 生成多种尺寸的图标

方法2：使用设计工具
1. 在 Figma/Sketch/Illustrator 中设计图标
2. 导出为 PNG，3种尺寸

方法3：使用代码生成
```bash
# 使用 sharp 包生成
npm install sharp
```

创建 scripts/generate-icons.js：
```javascript
const sharp = require('sharp')

const sizes = [16, 48, 128]
const svg = `
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#667eea"/>
  <text x="64" y="80" font-size="60" text-anchor="middle" fill="white">🌤️</text>
</svg>
`

sizes.forEach(size => {
  sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon${size}.png`)
    .then(() => console.log(`Generated icon${size}.png`))
})
```

运行：
```bash
node scripts/generate-icons.js
```

图标设计建议：
- 使用简单、易识别的图形
- 保持与主题色一致（#667eea 紫色渐变）
- 可使用天气或仪表盘相关图标
