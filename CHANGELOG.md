# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-15

### Added
- 配置页面添加返回按钮，方便用户快速返回新标签页
- 内容区域添加内部滚动条，优化长内容的浏览体验
- 美化的滚动条样式，与整体主题保持一致

### Fixed
- 修复页面高度不稳定导致的滚动条闪烁问题
- 优化配置页面布局，使用固定高度和内部滚动

### Improved
- 优化移动端响应式布局
- 改进页面头部布局，支持返回按钮的展示

---

## [1.0.0] - 2025-01-14

### Fixed
- 修复天气城市设置不生效的问题 - 修改 storage.ts 中的存储键映射逻辑，直接使用 key 作为存储键
- 修复选择城市后新标签页仍显示"北京"天气的问题

### Added
- 天气卡片添加存储变化监听，设置页面更改城市后已打开的标签页会实时更新

---

## Previous Versions

### Features
- 天气信息展示（温度、体感温度、湿度、风速等）
- 城市搜索和选择功能
- 工作日和薪资计算
- 新标签页仪表板
- 扩展设置页面

### Technical Stack
- Vue 3 + TypeScript
- Vite
- Chrome Extension Manifest V3
