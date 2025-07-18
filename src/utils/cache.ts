interface CachedStory {
  id: string
  title: string
  content: string
  scienceTopic: string
  storyNumber: number
  questions: Question[]
  createdAt: string
  cacheKey: string
}

interface CachedImage {
  url: string
  prompt: string
  createdAt: string
  cacheKey: string
}

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Generate a cache key based on user preferences and topic
function generateCacheKey(userId: string, character: string, age: number, topic: string, variation?: string): string {
  const baseKey = `${userId}_${character}_${age}_${topic.replace(/\s+/g, '_').toLowerCase()}`
  return variation ? `${baseKey}_${variation.replace(/\s+/g, '_').toLowerCase()}` : baseKey
}

// Story caching functions
export function getCachedStory(userId: string, character: string, age: number, topic: string): CachedStory | null {
  try {
    const cacheKey = generateCacheKey(userId, character, age, topic)
    const cached = localStorage.getItem(`story_cache_${cacheKey}`)
    
    if (!cached) return null
    
    const parsedCache = JSON.parse(cached) as CachedStory
    
    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - new Date(parsedCache.createdAt).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (cacheAge > maxAge) {
      // Cache expired, remove it
      localStorage.removeItem(`story_cache_${cacheKey}`)
      return null
    }
    
    return parsedCache
  } catch (error) {
    console.error('Error getting cached story:', error)
    return null
  }
}

export function cacheStory(userId: string, character: string, age: number, topic: string, story: Omit<CachedStory, 'cacheKey'>): void {
  try {
    const cacheKey = generateCacheKey(userId, character, age, topic)
    const cachedStory: CachedStory = {
      ...story,
      cacheKey
    }
    
    localStorage.setItem(`story_cache_${cacheKey}`, JSON.stringify(cachedStory))
    
    // Also maintain a list of all cached stories for cleanup
    const cacheList = localStorage.getItem('story_cache_list')
    const list = cacheList ? JSON.parse(cacheList) : []
    
    if (!list.includes(cacheKey)) {
      list.push(cacheKey)
      localStorage.setItem('story_cache_list', JSON.stringify(list))
    }
  } catch (error) {
    console.error('Error caching story:', error)
  }
}

// Image caching functions
export function getCachedImage(userId: string, character: string, age: number, topic: string): CachedImage | null {
  try {
    const cacheKey = generateCacheKey(userId, character, age, topic)
    const cached = localStorage.getItem(`image_cache_${cacheKey}`)
    
    if (!cached) return null
    
    const parsedCache = JSON.parse(cached) as CachedImage
    
    // Check if cache is still valid (7 days for images)
    const cacheAge = Date.now() - new Date(parsedCache.createdAt).getTime()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    
    if (cacheAge > maxAge) {
      // Cache expired, remove it
      localStorage.removeItem(`image_cache_${cacheKey}`)
      return null
    }
    
    return parsedCache
  } catch (error) {
    console.error('Error getting cached image:', error)
    return null
  }
}

export function cacheImage(userId: string, character: string, age: number, topic: string, url: string, prompt: string): void {
  try {
    const cacheKey = generateCacheKey(userId, character, age, topic)
    const cachedImage: CachedImage = {
      url,
      prompt,
      createdAt: new Date().toISOString(),
      cacheKey
    }
    
    localStorage.setItem(`image_cache_${cacheKey}`, JSON.stringify(cachedImage))
    
    // Also maintain a list of all cached images for cleanup
    const cacheList = localStorage.getItem('image_cache_list')
    const list = cacheList ? JSON.parse(cacheList) : []
    
    if (!list.includes(cacheKey)) {
      list.push(cacheKey)
      localStorage.setItem('image_cache_list', JSON.stringify(list))
    }
  } catch (error) {
    console.error('Error caching image:', error)
  }
}

// Cache management functions
export function clearAllCache(): void {
  try {
    // Clear story cache
    const storyCacheList = localStorage.getItem('story_cache_list')
    if (storyCacheList) {
      const storyList = JSON.parse(storyCacheList)
      storyList.forEach((cacheKey: string) => {
        localStorage.removeItem(`story_cache_${cacheKey}`)
      })
      localStorage.removeItem('story_cache_list')
    }
    
    // Clear image cache
    const imageCacheList = localStorage.getItem('image_cache_list')
    if (imageCacheList) {
      const imageList = JSON.parse(imageCacheList)
      imageList.forEach((cacheKey: string) => {
        localStorage.removeItem(`image_cache_${cacheKey}`)
      })
      localStorage.removeItem('image_cache_list')
    }
    
    console.log('All cache cleared successfully')
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

export interface CacheStats {
  totalStories: number
  totalImages: number
  cacheSize: string
  oldestEntry: string
  newestEntry: string
}

export function getCacheStats(): CacheStats {
  try {
    const storyCacheList = localStorage.getItem('story_cache_list')
    const imageCacheList = localStorage.getItem('image_cache_list')
    
    const storyCount = storyCacheList ? JSON.parse(storyCacheList).length : 0
    const imageCount = imageCacheList ? JSON.parse(imageCacheList).length : 0
    
    // Calculate approximate size and find oldest/newest entries
    let totalSize = 0
    let oldestDate: Date | null = null
    let newestDate: Date | null = null
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('story_cache_') || key.startsWith('image_cache_'))) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length
          
          try {
            const cached = JSON.parse(value)
            if (cached.createdAt) {
              const date = new Date(cached.createdAt)
              if (!oldestDate || date < oldestDate) {
                oldestDate = date
              }
              if (!newestDate || date > newestDate) {
                newestDate = date
              }
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
    }
    
    // Convert bytes to readable format
    const sizeInKB = (totalSize / 1024).toFixed(2)
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)
    const totalSizeStr = totalSize > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`
    
    return {
      totalStories: storyCount,
      totalImages: imageCount,
      cacheSize: totalSizeStr,
      oldestEntry: oldestDate ? oldestDate.toISOString() : 'None',
      newestEntry: newestDate ? newestDate.toISOString() : 'None'
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return { 
      totalStories: 0, 
      totalImages: 0, 
      cacheSize: '0 KB',
      oldestEntry: 'Error',
      newestEntry: 'Error'
    }
  }
}

export function clearExpiredCache(): number {
  try {
    let removedCount = 0
    
    // Clear expired story cache
    const storyCacheList = localStorage.getItem('story_cache_list')
    if (storyCacheList) {
      const storyList = JSON.parse(storyCacheList)
      const validStoryKeys: string[] = []
      
      storyList.forEach((cacheKey: string) => {
        const cached = localStorage.getItem(`story_cache_${cacheKey}`)
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached)
            const cacheAge = Date.now() - new Date(parsedCache.createdAt).getTime()
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            
            if (cacheAge > maxAge) {
              localStorage.removeItem(`story_cache_${cacheKey}`)
              removedCount++
            } else {
              validStoryKeys.push(cacheKey)
            }
          } catch {
            localStorage.removeItem(`story_cache_${cacheKey}`)
            removedCount++
          }
        }
      })
      
      localStorage.setItem('story_cache_list', JSON.stringify(validStoryKeys))
    }
    
    // Clear expired image cache
    const imageCacheList = localStorage.getItem('image_cache_list')
    if (imageCacheList) {
      const imageList = JSON.parse(imageCacheList)
      const validImageKeys: string[] = []
      
      imageList.forEach((cacheKey: string) => {
        const cached = localStorage.getItem(`image_cache_${cacheKey}`)
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached)
            const cacheAge = Date.now() - new Date(parsedCache.createdAt).getTime()
            const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
            
            if (cacheAge > maxAge) {
              localStorage.removeItem(`image_cache_${cacheKey}`)
              removedCount++
            } else {
              validImageKeys.push(cacheKey)
            }
          } catch {
            localStorage.removeItem(`image_cache_${cacheKey}`)
            removedCount++
          }
        }
      })
      
      localStorage.setItem('image_cache_list', JSON.stringify(validImageKeys))
    }
    
    return removedCount
  } catch (error) {
    console.error('Error clearing expired cache:', error)
    return 0
  }
}

// Cache manager object for the CacheManager component
export const cacheManager = {
  getCacheStats,
  clearCache: clearAllCache,
  clearExpiredCache
}