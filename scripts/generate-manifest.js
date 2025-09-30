#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取配置，提供默认值
const getEnvVar = (key, defaultValue) => {
  return process.env[key] || defaultValue;
};

// 根据环境生成不同的配置
const generateManifest = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 从环境变量读取，如果没有则使用默认值
  const baseUrl = getEnvVar('NEXT_PUBLIC_BASE_URL', 
    isProduction ? 'https://app.linkol.fun' : 'https://test.linkol.fun'
  );
  
  const manifest = {
    url: baseUrl,
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Linkol Event'),
    iconUrl: getEnvVar('NEXT_PUBLIC_ICON_URL', 'https://app.linkol.fun/favicon.ico'),
    termsOfUseUrl: getEnvVar('NEXT_PUBLIC_TERMS_URL', 'https://www.linkol.fun/terms-of-use'),
    privacyPolicyUrl: getEnvVar('NEXT_PUBLIC_PRIVACY_URL', 'https://www.linkol.fun/privacy-policy')
  };

  return JSON.stringify(manifest, null, 2);
};

// 生成文件
const manifestPath = path.join(__dirname, '..', 'public', 'tonconnect-manifest.json');
const manifestContent = generateManifest();

fs.writeFileSync(manifestPath, manifestContent);
console.log('✅ tonconnect-manifest.json generated successfully');
console.log('📄 Content:', manifestContent);
