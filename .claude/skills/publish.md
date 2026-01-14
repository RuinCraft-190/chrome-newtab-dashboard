---
description: 发布到 Chrome Web Store
---

将扩展发布到 Chrome 应用商店。

准备工作：
1. 注册 Chrome Web Store 开发者账号（$5 一次性费用）
2. 准备以下材料：
   - 扩展图标（128x128）
   - 商店图标（128x128，如果是扩展包可能不需要）
   - 宣传图片（可选）：1280x800 或 640x400
   - 屏幕截图（至少一张，建议 3-5 张）：1280x800 或 640x400
   - 详细描述
   - 隐私政策（如果收集数据）

发布步骤：
1. 构建生产版本：
   ```bash
   npm run build
   ```

2. 打包扩展：
   ```bash
   cd dist
   zip -r ../extension.zip .
   cd ..
   ```

3. 访问 Chrome Web Store Developer Dashboard：
   https://chrome.google.com/webstore/devconsole

4. 点击"新建项目"
5. 上传 extension.zip
6. 填写商店信息：
   - 名称：新标签页仪表盘
   - 简短描述：天气和自动签到的新标签页
   - 详细描述：（使用 README.md 内容）
   - 类别：生产力工具
   - 语言：中文（简体）

7. 上传图片资产

8. 填写隐私权实践：
   - 未收集用户数据
   - 所有数据存储在本地

9. 提交审核

审核注意事项：
- 审核通常需要 3-7 天
- 确保没有使用其他服务的商标
- 确保功能描述准确
- 提供有效的支持联系邮箱
