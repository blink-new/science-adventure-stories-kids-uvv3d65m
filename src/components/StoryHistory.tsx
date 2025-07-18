import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, BookOpen, Calendar, Trophy, Eye } from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  scienceTopic: string
  storyNumber: number
  questions: Question[]
  moodImage?: string
  answers?: string[]
  completedAt: string
  createdAt: string
}

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface StoryHistoryProps {
  character: 'sia' | 'raghav'
  profile: { gender: string; age: number }
  userId: string
  onBack: () => void
  onReadStory: (story: Story) => void
}

export function StoryHistory({ character, profile, userId, onBack, onReadStory }: StoryHistoryProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

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

  useEffect(() => {
    // Load stories from localStorage
    const savedStories = localStorage.getItem(`stories_${userId}`)
    if (savedStories) {
      const parsedStories = JSON.parse(savedStories)
      setStories(parsedStories.sort((a: Story, b: Story) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConceptsLearned = () => {
    const concepts = new Set<string>()
    stories.forEach(story => {
      if (story.completedAt) {
        concepts.add(story.scienceTopic)
      }
    })
    return Array.from(concepts)
  }

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedStory(null)}
              className="font-comic hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            <Badge variant="secondary" className="font-comic">
              Adventure #{selectedStory.storyNumber}
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Story Header */}
          <Card className="border-4 border-primary/30 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${info.bgGradient} rounded-full flex items-center justify-center ${info.borderColor} border-4`}>
                  <span className="text-3xl">{info.emoji}</span>
                </div>
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-comic text-primary mb-2">
                {selectedStory.title}
              </CardTitle>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="outline" className="text-lg font-comic px-4 py-2">
                  🔬 {selectedStory.scienceTopic}
                </Badge>
                <Badge variant="outline" className="text-sm font-comic px-3 py-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(selectedStory.createdAt)}
                </Badge>
                {selectedStory.completedAt && (
                  <Badge variant="default" className="text-sm font-comic px-3 py-1 bg-green-500">
                    <Trophy className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Mood Image */}
          {selectedStory.moodImage && (
            <Card className="border-4 border-gray-300 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={selectedStory.moodImage} 
                    alt={`Atmospheric scene for ${selectedStory.scienceTopic}`}
                    className="w-full h-64 md:h-80 object-cover filter grayscale"
                    style={{ 
                      filter: 'grayscale(100%) contrast(1.1) brightness(0.9)',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-comic bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      🎨 The mood for this adventure
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Story Content */}
          <Card className="border-4 border-primary/20 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-lg leading-relaxed font-comic text-gray-800 whitespace-pre-wrap">
                  {selectedStory.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          {selectedStory.questions && selectedStory.questions.length > 0 && (
            <Card className="border-4 border-accent/30 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-2xl font-comic text-center text-gray-800">
                  🤔 Test Your Knowledge!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedStory.questions.map((q, index) => (
                  <div key={index} className="bg-white/80 rounded-lg p-4 border-2 border-accent/20">
                    <h4 className="text-lg font-comic font-bold text-gray-800 mb-3">
                      Question {index + 1}: {q.question}
                    </h4>
                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`p-3 rounded-lg border-2 font-comic ${
                            optionIndex === q.correctAnswer 
                              ? 'bg-green-100 border-green-300 text-green-800' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {optionIndex === q.correctAnswer && (
                            <span className="ml-2 text-green-600">✓ Correct!</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <p className="text-sm font-comic text-blue-800">
                        <strong>💡 Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="font-comic hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${info.bgGradient} rounded-full flex items-center justify-center ${info.borderColor} border-2`}>
              <span className="text-2xl">{info.emoji}</span>
            </div>
            <div>
              <h1 className="text-2xl font-comic font-bold text-primary">
                {info.name}'s Story History
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-4 border-primary/30 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-comic font-bold text-primary">{stories.length}</div>
              <div className="text-lg font-comic text-gray-600">Stories Read</div>
            </CardContent>
          </Card>
          
          <Card className="border-4 border-accent/30 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🧠</div>
              <div className="text-3xl font-comic font-bold text-accent">{getConceptsLearned().length}</div>
              <div className="text-lg font-comic text-gray-600">Concepts Learned</div>
            </CardContent>
          </Card>
          
          <Card className="border-4 border-green-300 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-3xl font-comic font-bold text-green-600">
                {stories.filter(s => s.completedAt).length}
              </div>
              <div className="text-lg font-comic text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Concepts Learned */}
        {getConceptsLearned().length > 0 && (
          <Card className="border-4 border-primary/20 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-comic text-center">
                🌟 Science Concepts You've Mastered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {getConceptsLearned().map((concept, index) => (
                  <Badge key={index} variant="secondary" className="text-sm font-comic px-3 py-2">
                    🔬 {concept}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stories List */}
        <div className="space-y-6">
          <h3 className="text-3xl font-comic font-bold text-center text-gray-800">
            Your Adventure Stories
          </h3>
          
          {stories.length === 0 ? (
            <Card className="border-4 border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h4 className="text-2xl font-comic font-bold text-gray-600 mb-2">
                  No stories yet!
                </h4>
                <p className="text-lg font-comic text-gray-500">
                  Start your first adventure with {info.name} to see your stories here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {stories.map((story) => (
                <Card key={story.id} className="border-4 border-primary/20 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-comic text-primary mb-2">
                          {story.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-sm font-comic">
                            Adventure #{story.storyNumber}
                          </Badge>
                          {story.completedAt && (
                            <Badge variant="default" className="text-sm font-comic bg-green-500">
                              <Trophy className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-sm font-comic">
                          🔬 {story.scienceTopic}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm font-comic text-gray-600 line-clamp-3">
                        {story.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-comic text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(story.createdAt)}
                        </span>
                        <Button
                          onClick={() => setSelectedStory(story)}
                          className={`${info.buttonClass} text-white font-comic text-sm px-4 py-2`}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Read Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}