import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cacheManager, CacheStats } from '../utils/cache'

interface CacheManagerProps {
  userId: string
  onClose: () => void
}

export function CacheManager({ userId, onClose }: CacheManagerProps) {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [isCleaningExpired, setIsCleaningExpired] = useState(false)
  const [lastAction, setLastAction] = useState<string>('')

  const loadStats = () => {
    const cacheStats = cacheManager.getCacheStats()
    setStats(cacheStats)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleClearAll = async () => {
    setIsClearing(true)
    setLastAction('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Show loading state
      cacheManager.clearCache()
      setLastAction('All cache cleared successfully!')
      loadStats()
    } catch (error) {
      setLastAction('Error clearing cache')
      console.error('Error clearing cache:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearExpired = async () => {
    setIsCleaningExpired(true)
    setLastAction('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Show loading state
      const removedCount = cacheManager.clearExpiredCache()
      setLastAction(`Removed ${removedCount} expired entries`)
      loadStats()
    } catch (error) {
      setLastAction('Error cleaning expired cache')
      console.error('Error cleaning expired cache:', error)
    } finally {
      setIsCleaningExpired(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (dateString === 'None' || dateString === 'Error') return dateString
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  const getCacheHealthColor = () => {
    if (!stats) return 'text-gray-500'
    const totalEntries = stats.totalStories + stats.totalImages
    if (totalEntries === 0) return 'text-gray-500'
    if (totalEntries < 20) return 'text-green-600'
    if (totalEntries < 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCacheHealthIcon = () => {
    if (!stats) return <Database className="h-5 w-5" />
    const totalEntries = stats.totalStories + stats.totalImages
    if (totalEntries === 0) return <Database className="h-5 w-5" />
    if (totalEntries < 50) return <CheckCircle className="h-5 w-5" />
    return <AlertCircle className="h-5 w-5" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-4 border-primary/30 max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-comic text-primary">
                  Cache Manager
                </CardTitle>
                <p className="text-sm font-comic text-gray-600">
                  Manage your story and image cache
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-comic hover:bg-gray-100"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Cache Statistics */}
          <div className="space-y-4">
            <h3 className="text-xl font-comic font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cache Statistics
            </h3>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStories}</div>
                    <div className="text-sm font-comic text-blue-700">Stories</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalImages}</div>
                    <div className="text-sm font-comic text-purple-700">Images</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.cacheSize}</div>
                    <div className="text-sm font-comic text-green-700">Size</div>
                  </div>
                </div>
                
                <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getCacheHealthColor()}`}>
                      {getCacheHealthIcon()}
                    </div>
                    <div className="text-sm font-comic text-gray-700">Health</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cache Details */}
          {stats && (
            <div className="space-y-4">
              <h3 className="text-xl font-comic font-bold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cache Details
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-comic">
                  <div>
                    <span className="font-bold text-gray-700">Oldest Entry:</span>
                    <div className="text-gray-600">{formatDate(stats.oldestEntry)}</div>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Newest Entry:</span>
                    <div className="text-gray-600">{formatDate(stats.newestEntry)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-comic font-bold text-gray-800 flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Cache Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleClearExpired}
                disabled={isCleaningExpired}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-comic py-6 rounded-lg"
              >
                {isCleaningExpired ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cleaning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Clean Expired
                  </div>
                )}
              </Button>
              
              <Button
                onClick={handleClearAll}
                disabled={isClearing}
                variant="destructive"
                className="font-comic py-6 rounded-lg"
              >
                {isClearing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Clearing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Clear All Cache
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Action Result */}
          {lastAction && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-comic">
                <CheckCircle className="h-5 w-5" />
                {lastAction}
              </div>
            </div>
          )}

          {/* Cache Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-comic font-bold text-blue-800 mb-2">ℹ️ About Cache</h4>
            <div className="text-sm font-comic text-blue-700 space-y-1">
              <p>• Stories and images are cached based on character, age group, and topic</p>
              <p>• Cache entries expire after 30 days automatically</p>
              <p>• Maximum 100 entries per cache type (stories/images)</p>
              <p>• Cached content loads instantly without AI generation</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="text-center pt-4">
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white font-comic px-8 py-3 rounded-lg"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}