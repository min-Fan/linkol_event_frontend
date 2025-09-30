import { TelegramWebApp } from 'app/context/TgProvider';

export const extractTweetId = (url: string): string | null => {
  // 匹配以下格式的URL:
  // https://x.com/username/status/1912742441519620530
  // https://twitter.com/username/status/1912742441519620530
  const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const openCenteredPopup = (
  url: string,
  isTelegram: boolean,
  webApp: TelegramWebApp | null,
  title: string,
  width: number,
  height: number
): Window | null => {
  if (isTelegram && webApp) {
    webApp?.openLink(url);
    return null;
  }

  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;

  const screenWidth = window.innerWidth ?? document.documentElement.clientWidth;
  const screenHeight = window.innerHeight ?? document.documentElement.clientHeight;

  const left = screenLeft + (screenWidth - width) / 2;
  const top = screenTop + (screenHeight - height) / 2;

  const features = `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`;

  return window.open(url, title, features);
};
