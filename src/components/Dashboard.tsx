import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { BookOpen, Sparkles, Trophy, ArrowRight, Settings, History, Database } from 'lucide-react'
import { CacheManager } from './CacheManager'

interface DashboardProps {
  character: 'sia' | 'raghav'
  profile: { gender: string; age: number }
  userId: string
  onStartAdventure: () => void
  onViewHistory: () => void
  onLogout: () => void
}

export function Dashboard({ character, profile, userId, onStartAdventure, onViewHistory, onLogout }: DashboardProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [showCacheManager, setShowCacheManager] = useState(false)

  const characterInfo = {
    sia: {
      name: 'Sia',
      emoji: '👧🏻',
      color: 'pink',
      bgGradient: 'from-pink-200 to-purple-200',
      borderColor: 'border-pink-300',
      buttonClass: 'bg-pink-500 hover:bg-pink-600'
    },
    raghav: {
      name: 'Raghav',
      emoji: '👦🏻',
      color: 'blue',
      bgGradient: 'from-blue-200 to-green-200',
      borderColor: 'border-blue-300',
      buttonClass: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const info = characterInfo[character]

  const handleStartAdventure = async () => {
    setIsStarting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onStartAdventure()
  }

  const scienceTopics = [
    { icon: '🌱', name: 'Plants & Nature', description: 'Discover how plants grow and survive' },
    { icon: '🦋', name: 'Animals & Insects', description: 'Learn about amazing creatures' },
    { icon: '🌍', name: 'Earth & Weather', description: 'Explore our planet and climate' },
    { icon: '⭐', name: 'Space & Stars', description: 'Journey to the cosmos' },
    { icon: '💧', name: 'Water & Ocean', description: 'Dive into aquatic mysteries' },
    { icon: '🔬', name: 'Science Experiments', description: 'Fun hands-on discoveries' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${info.bgGradient} rounded-full flex items-center justify-center ${info.borderColor} border-2`}>
              <span className="text-2xl">{info.emoji}</span>
            </div>
            <div>
              <h1 className="text-2xl font-comic font-bold text-primary">
                {info.name}'s Adventure Hub
              </h1>
              <p className="text-sm font-comic text-gray-600">
                Welcome back, young explorer!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onViewHistory}
              className="font-comic hover:bg-white/50"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCacheManager(true)}
              className="font-comic hover:bg-white/50"
              title="Manage cache"
            >
              <Database className="h-4 w-4 mr-2" />
              Cache
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="font-comic hover:bg-white/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-bounce-gentle" />
            <Trophy className="h-8 w-8 text-accent" />
            <Sparkles className="h-8 w-8 text-primary animate-bounce-gentle" />
          </div>
          <h2 className="text-4xl md:text-5xl font-comic font-bold text-primary">
            Ready for an Adventure?
          </h2>
          <p className="text-xl font-comic text-gray-700 max-w-2xl mx-auto">
            {info.name} has prepared amazing science stories just for you!
          </p>
        </div>

        {/* Profile Info */}
        <Card className="border-4 border-primary/30 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-comic text-center">Your Adventure Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <Badge variant="secondary" className="text-lg font-comic px-4 py-2">
                  {profile.gender === 'girl' ? '👧' : '👦'} {profile.gender}
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="text-lg font-comic px-4 py-2">
                  🎂 {profile.age} years old
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="text-lg font-comic px-4 py-2">
                  🌟 Adventure Buddy: {info.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Adventure Button */}
        <div className="text-center">
          <Button
            onClick={handleStartAdventure}
            disabled={isStarting}
            className={`${info.buttonClass} text-white font-comic text-2xl px-12 py-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            size="lg"
          >
            {isStarting ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {info.name} is preparing your adventure...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                Begin Your First Adventure!
                <ArrowRight className="h-8 w-8" />
              </div>
            )}
          </Button>
        </div>

        {/* Science Topics Preview */}
        <div className="space-y-6">
          <h3 className="text-3xl font-comic font-bold text-center text-gray-800">
            What Will You Discover?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scienceTopics.map((topic, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-primary/50 transition-colors bg-white/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <div className="text-4xl mb-2">{topic.icon}</div>
                  <CardTitle className="text-lg font-comic">{topic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center font-comic">
                    {topic.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-300">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h4 className="text-2xl font-comic font-bold text-gray-800">Did You Know? 🤔</h4>
              <p className="text-lg font-comic text-gray-700">
                Each adventure story is specially created to match your age and interests!
              </p>
              <p className="text-base font-comic text-gray-600">
                {info.name} will guide you through amazing discoveries about our world!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Manager Modal */}
      {showCacheManager && (
        <CacheManager
          userId={userId}
          onClose={() => setShowCacheManager(false)}
        />
      )}
    </div>
  )
}