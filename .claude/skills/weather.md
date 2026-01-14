---
description: 配置和风天气 API
---

配置和风天气 API 以启用天气功能。

执行步骤：
1. 注册和风天气开发者账号：https://dev.qweather.com/
2. 创建应用获取 API Key
3. 在项目根目录创建 `.env` 文件：
   ```
   VITE_QWEATHER_API_KEY=你的API_KEY
   ```
4. 或在扩展设置页面中配置 API Key

API 说明：
- 免费版：1000 次/天
- 实时天气端点：/v7/weather/now
- 城市搜索端点：/v7/city/lookup

城市 ID 查询：
- 可使用城市名称（如"北京"）
- 可使用城市 ID（如"101010100"）
- 使用城市搜索功能获取精确 ID

测试 API：
```bash
curl "https://devapi.qweather.com/v7/weather/now?location=101010100&key=你的KEY"
```
