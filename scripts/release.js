import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 读取 package.json 获取版本号和项目名
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version = packageJson.version;
const projectName = packageJson.name;
const zipFileName = `${projectName}.zip`;
const zipFilePath = join(rootDir, 'dist', zipFileName);

// 读取 CHANGELOG.md 获取最新更新内容
const changelogPath = join(rootDir, 'CHANGELOG.md');
let latestChanges = '更新内容';
if (existsSync(changelogPath)) {
  const changelog = readFileSync(changelogPath, 'utf-8');
  latestChanges = changelog.split('## ')[1]?.split('\n\n')[0] || '更新内容';
}

console.log(`📦 准备发布 v${version}...`);

try {
  // 1. 先执行构建
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. 检查 zip 文件是否存在
  if (!existsSync(zipFilePath)) {
    console.error(`❌ 打包文件不存在: ${zipFilePath}`);
    process.exit(1);
  }

  // 3. 检查是否有未提交的更改
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status.trim()) {
    console.error('❌ 有未提交的更改，请先提交代码');
    process.exit(1);
  }

  // 4. 创建 git tag
  console.log(`🏷️  创建标签 v${version}...`);
  execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });

  // 5. 推送 tag 到远程
  console.log('📤 推送标签到 GitHub...');
  execSync(`git push origin v${version}`, { stdio: 'inherit' });

  // 6. 创建 GitHub Release
  console.log('🚀 创建 GitHub Release...');
  const releaseNotes = `# Chrome 新标签页仪表盘 v${version}\n\n${latestChanges}\n\n## 下载\n\n- [${zipFileName}](https://github.com/RuinCraft-190/chrome-newtab-dashboard/releases/download/v${version}/${zipFileName})`;

  execSync(
    `gh release create v${version} "${zipFilePath}" --title "v${version}" --notes "${releaseNotes}"`,
    { stdio: 'inherit' }
  );

  console.log(`✅ 发布成功！访问: https://github.com/RuinCraft-190/chrome-newtab-dashboard/releases/tag/v${version}`);
} catch (error) {
  console.error('❌ 发布失败:', error.message);
  process.exit(1);
}
