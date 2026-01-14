---
description: 测试签到功能
---

测试特定网站的签到功能。

使用方法：/test "网站URL"

执行步骤：
1. 确保扩展已加载到 Chrome
2. 打开目标网站
3. 按 F12 打开 DevTools
4. 在 Console 中执行测试：
   ```javascript
   // 获取当前页面适配器状态
   chrome.runtime.sendMessage({
     action: 'GET_CHECKIN_STATUS'
   }, console.log)
   ```

5. 手动触发签到：
   ```javascript
   chrome.runtime.sendMessage({
     action: 'CHECK_IN'
   }, console.log)
   ```

6. 查看签到结果：
   ```javascript
   chrome.storage.local.get('checkin', (result) => {
     console.log('Check-in records:', result.checkin.records)
   })
   ```

测试检查清单：
- [ ] 适配器正确识别网站
- [ ] 检测登录状态正确
- [ ] 检测签到状态正确
- [ ] 点击签到按钮成功
- [ ] 签到结果正确记录
- [ ] 连续签到天数正确更新

常见问题：
- "No adapter found": 检查 URL 匹配模式
- "未找到签到按钮": 检查选择器是否正确
- "未登录": 先登录网站再测试
