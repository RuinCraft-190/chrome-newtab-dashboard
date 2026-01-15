# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- 签到功能（支持 PT 站和通用网站）
- 工作日和薪资计算
- 新标签页仪表板
- 扩展设置页面

### Technical Stack
- Vue 3 + TypeScript
- Vite
- Chrome Extension Manifest V3
