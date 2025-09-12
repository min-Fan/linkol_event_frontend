import { getPrice, LanguageCode } from '@libs/request';

// 图片缓存接口
export interface ImageCacheItem {
  eventId: string;
  screenName: string;
  imageUrl: string;
  templateData: any;
  generatedAt: number;
  expiresAt: number;
}

// 图片缓存管理类
export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Map<string, ImageCacheItem> = new Map();
  private readonly CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24小时过期

  private constructor() {}

  public static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  // 生成缓存键
  private getCacheKey(eventId: string, screenName: string): string {
    return `${eventId}_${screenName}`;
  }

  // 检查缓存是否存在且未过期
  public isCached(eventId: string, screenName: string): boolean {
    const key = this.getCacheKey(eventId, screenName);
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // 获取缓存的图片
  public getCachedImage(eventId: string, screenName: string): ImageCacheItem | null {
    const key = this.getCacheKey(eventId, screenName);
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item;
  }

  // 缓存图片
  public setCachedImage(
    eventId: string, 
    screenName: string, 
    imageUrl: string, 
    templateData: any
  ): void {
    const key = this.getCacheKey(eventId, screenName);
    const now = Date.now();
    
    this.cache.set(key, {
      eventId,
      screenName,
      imageUrl,
      templateData,
      generatedAt: now,
      expiresAt: now + this.CACHE_EXPIRY_TIME,
    });
  }

  // 清除特定事件的缓存
  public clearEventCache(eventId: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.eventId === eventId) {
        this.cache.delete(key);
      }
    }
  }

  // 清除所有缓存
  public clearAllCache(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  public getCacheStats(): { totalItems: number; eventIds: string[] } {
    const eventIds = new Set<string>();
    for (const item of this.cache.values()) {
      eventIds.add(item.eventId);
    }
    
    return {
      totalItems: this.cache.size,
      eventIds: Array.from(eventIds),
    };
  }
}

// 图片生成工具类
export class ImageGenerator {
  private static instance: ImageGenerator;
  private cacheManager: ImageCacheManager;

  private constructor() {
    this.cacheManager = ImageCacheManager.getInstance();
  }

  public static getInstance(): ImageGenerator {
    if (!ImageGenerator.instance) {
      ImageGenerator.instance = new ImageGenerator();
    }
    return ImageGenerator.instance;
  }

  // 预生成图片并缓存
  public async preGenerateImages(
    eventId: string,
    eventTitle: string,
    twitterFullProfile: any,
    language: LanguageCode = LanguageCode.English
  ): Promise<{ success: boolean; cachedImages: string[]; error?: string }> {
    try {
      // 检查是否支持图片模板
      const templateConfig = this.getImageTemplateConfig(eventTitle, twitterFullProfile);
      if (!templateConfig) {
        return { success: false, cachedImages: [], error: 'No template config found' };
      }

      // 获取KOL数据
      const kolScreenNames = await this.getKolScreenNames(eventId, twitterFullProfile, language);
      if (kolScreenNames.length === 0) {
        return { success: false, cachedImages: [], error: 'No KOL data found' };
      }

      // 检查哪些图片已经缓存
      const uncachedScreenNames = kolScreenNames.filter(
        (screenName) => !this.cacheManager.isCached(eventId, screenName)
      );

      if (uncachedScreenNames.length === 0) {
        // 所有图片都已缓存，直接返回
        const cachedImages = kolScreenNames
          .map((screenName) => this.cacheManager.getCachedImage(eventId, screenName))
          .filter((item): item is ImageCacheItem => item !== null)
          .map((item) => item.imageUrl);
        
        return { success: true, cachedImages };
      }

      // 获取模板数据
      const templateData = await this.fetchTemplateData(uncachedScreenNames, templateConfig);
      if (!templateData || templateData.length === 0) {
        return { success: false, cachedImages: [], error: 'Failed to fetch template data' };
      }

      // 注意：实际的图片生成需要在组件中进行，因为需要DOM操作
      // 这里只返回需要生成图片的信息
      return { 
        success: true, 
        cachedImages: [], 
        error: 'Image generation needs to be done in component with DOM access' 
      };

    } catch (error) {
      console.error('Failed to pre-generate images:', error);
      return { 
        success: false, 
        cachedImages: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // 获取缓存的图片
  public getCachedImages(eventId: string, screenNames: string[]): string[] {
    return screenNames
      .map((screenName) => this.cacheManager.getCachedImage(eventId, screenName))
      .filter((item): item is ImageCacheItem => item !== null)
      .map((item) => item.imageUrl);
  }

  // 获取图片模板配置
  private getImageTemplateConfig(eventTitle: string, twitterFullProfile: any) {
    switch (eventTitle) {
      case 'Tweet Value Checker':
        return {
          component: 'DownloadCard', // 这里需要实际的组件引用
          dataFetcher: async (screenName: string) => {
            try {
              const res: any = await getPrice({ screen_name: screenName });
              return res.code === 200 ? res.data : null;
            } catch (error) {
              console.error(`Failed to get price for ${screenName}:`, error);
              return null;
            }
          },
          fileName: 'tweet-value-card',
        };
      default:
        return null;
    }
  }

  // 获取KOL名称列表
  private async getKolScreenNames(
    eventId: string, 
    twitterFullProfile: any, 
    language: LanguageCode
  ): Promise<string[]> {
    // 这里需要调用实际的API来获取KOL列表
    // 暂时返回当前用户的screen_name作为示例
    if (twitterFullProfile?.screen_name) {
      return [twitterFullProfile.screen_name];
    }
    return [];
  }

  // 获取模板数据
  private async fetchTemplateData(screenNames: string[], templateConfig: any) {
    if (!templateConfig?.dataFetcher) return null;

    try {
      const pricePromises = screenNames.map((screenName) =>
        templateConfig.dataFetcher(screenName).catch((error) => {
          console.error(`Failed to get data for ${screenName}:`, error);
          return null;
        })
      );

      const results = await Promise.all(pricePromises);
      return results.filter((result) => result !== null);
    } catch (error) {
      console.error('Failed to fetch template data:', error);
      return null;
    }
  }

  // 生成并上传图片
  private async generateAndUploadImages(
    templateData: any[],
    templateConfig: any,
    screenNames: string[]
  ): Promise<string[]> {
    // 这里需要实际的图片生成逻辑
    // 由于需要DOM操作，这部分应该在组件中实现
    // 这里只返回空数组作为占位符
    return [];
  }
}

// 导出单例实例
export const imageCacheManager = ImageCacheManager.getInstance();
export const imageGenerator = ImageGenerator.getInstance();
