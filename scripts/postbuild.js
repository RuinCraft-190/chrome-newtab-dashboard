import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const distDir = join(rootDir, 'dist');
const zipFileName = 'chrome-newtab-dashboard.zip';
const zipFilePath = join(distDir, zipFileName);

console.log('📦 开始打包 dist 目录...');

const command = process.platform === 'win32'
  ? `powershell Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipFilePath}" -Force`
  : `cd "${distDir}" && zip -r "${zipFilePath}" *`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 打包失败:', error.message);
    process.exit(1);
  }
  if (stderr) {
    console.error('❌ 打包出错:', stderr);
    process.exit(1);
  }
  console.log(`✅ 打包成功: ${zipFilePath}`);
});
