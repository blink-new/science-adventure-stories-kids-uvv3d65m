import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, RotateCcw, CheckCircle, XCircle, Zap } from 'lucide-react'
import { blink } from '../blink/client'
import { getCachedStory, cacheStory, getCachedImage, cacheImage } from '../utils/cache'

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Story {
  id: string
  title: string
  content: string
  scienceTopic: string
  storyNumber: number
  questions: Question[]
  moodImage?: string
  answers?: string[]
  completedAt?: string
  createdAt: string
}

interface StoryReaderProps {
  character: 'sia' | 'raghav'
  profile: { gender: string; age: number }
  storyNumber: number
  userId: string
  onBack: () => void
  onNextStory: () => void
}

export function StoryReader({ character, profile, storyNumber, userId, onBack, onNextStory }: StoryReaderProps) {
  const [story, setStory] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [scienceTopic, setScienceTopic] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingNext, setIsGeneratingNext] = useState(false)
  const [currentStoryId, setCurrentStoryId] = useState<string>('')
  const [moodImage, setMoodImage] = useState<string>('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isUsingCache, setIsUsingCache] = useState(false)
  const [cacheHit, setCacheHit] = useState<{ story: boolean; image: boolean }>({ story: false, image: false })

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

  const scienceTopics = [
    'Plants and How They Grow',
    'Amazing Animals and Their Homes',
    'Weather and Clouds',
    'The Solar System and Stars',
    'Ocean Life and Water Cycle',
    'Simple Machines and How They Work',
    'Butterflies and Their Life Cycle',
    'Rocks, Minerals and Fossils',
    'Light and Shadows',
    'Sound and Music',
    'Magnets and Their Magic',
    'Seasons and Why They Change'
  ]

  const generateStory = async () => {
    setIsLoading(true)
    setShowResults(false)
    setUserAnswers([])
    setMoodImage('')
    setIsUsingCache(false)
    setCacheHit({ story: false, image: false })
    
    try {
      // Get previously used topics to avoid repetition
      const existingStories = localStorage.getItem(`stories_${userId}`)
      const usedTopics = existingStories ? JSON.parse(existingStories).map((s: Story) => s.scienceTopic) : []
      
      // Filter out recently used topics (last 3 stories)
      const recentTopics = usedTopics.slice(-3)
      const availableTopics = scienceTopics.filter(topic => !recentTopics.includes(topic))
      
      // If all topics have been used recently, use all topics
      const topicsToChooseFrom = availableTopics.length > 0 ? availableTopics : scienceTopics
      
      // Select a random topic from available ones
      const randomTopic = topicsToChooseFrom[Math.floor(Math.random() * topicsToChooseFrom.length)]
      setScienceTopic(randomTopic)
      
      const storyTitle = `${info.name} and the ${randomTopic.replace('and', '&')}`
      setTitle(storyTitle)

      // Check cache first, but only use it occasionally to ensure variety
      const shouldUseCache = Math.random() < 0.3 // 30% chance to use cache
      const cachedStory = shouldUseCache ? getCachedStory(userId, character, profile.age, randomTopic) : null
      const cachedImage = getCachedImage(userId, character, profile.age, randomTopic)

      let storyText = ''
      let parsedQuestions: Question[] = []
      let imageUrl = ''

      if (cachedStory && shouldUseCache) {
        // Use cached story
        console.log('📚 Using cached story for:', randomTopic)
        setIsUsingCache(true)
        setCacheHit(prev => ({ ...prev, story: true }))
        
        storyText = cachedStory.content
        parsedQuestions = cachedStory.questions
        setStory(storyText)
        setQuestions(parsedQuestions)
      } else {
        // Generate new story
        console.log('🔄 Generating new story for:', randomTopic)
        
        // Add variety to story generation
        const storyVariations = [
          'a magical discovery adventure',
          'an exciting exploration journey',
          'a mysterious science quest',
          'a thrilling outdoor expedition',
          'a fascinating investigation',
          'an amazing learning adventure'
        ]
        
        const storySettings = [
          'in a beautiful forest',
          'near a sparkling lake',
          'in a colorful garden',
          'on a sunny hillside',
          'by the ocean shore',
          'in a peaceful meadow',
          'near a babbling brook',
          'in their backyard'
        ]
        
        const randomVariation = storyVariations[Math.floor(Math.random() * storyVariations.length)]
        const randomSetting = storySettings[Math.floor(Math.random() * storySettings.length)]
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
        
        const storyPrompt = `Write a unique 500-1000 word educational adventure story for a ${profile.age}-year-old ${profile.gender} about ${randomTopic}. 

This should be ${randomVariation} ${randomSetting}. The main character is ${info.name}, a curious and brave young explorer. 

Story ID: ${uniqueId} (make this story completely unique and different from any previous stories)

The story should:
- Be age-appropriate for ${profile.age}-year-olds
- Teach about ${randomTopic} in a fun, engaging way
- Include simple scientific facts woven naturally into the adventure
- Have an exciting plot with discovery and wonder
- Use vocabulary suitable for ages 6-10
- End with ${info.name} learning something amazing about science
- Be between 500-1000 words
- Include the setting: ${randomSetting}
- Follow the theme: ${randomVariation}

Make it exciting, educational, and full of wonder! Ensure this story is completely unique and different from other stories about ${randomTopic}.`

        const { text: generatedStoryText } = await blink.ai.generateText({
          prompt: storyPrompt,
          model: 'gpt-4o-mini',
          maxTokens: 1200
        })

        storyText = generatedStoryText
        setStory(storyText)

        // Generate questions based on the story
        const questionsPrompt = `Based on the following story about ${randomTopic}, create exactly 3 multiple-choice questions that test a ${profile.age}-year-old's understanding of the science concepts presented. 

Story: ${storyText}

For each question, provide:
1. A clear question suitable for ages 6-10
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (0 for A, 1 for B, 2 for C, 3 for D)
4. A simple explanation of why the answer is correct

Format your response as a JSON array like this:
[
  {
    "question": "What did ${info.name} learn about...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Simple explanation suitable for kids"
  }
]

Make sure the questions focus on the key science concepts from the story and are appropriate for a ${profile.age}-year-old.`

        const { text: questionsText } = await blink.ai.generateText({
          prompt: questionsPrompt,
          model: 'gpt-4o-mini',
          maxTokens: 800
        })

        try {
          // Try to parse the questions JSON
          const generatedQuestions = JSON.parse(questionsText)
          if (Array.isArray(generatedQuestions) && generatedQuestions.length === 3) {
            parsedQuestions = generatedQuestions
            setQuestions(parsedQuestions)
          } else {
            throw new Error('Invalid questions format')
          }
        } catch (parseError) {
          console.error('Error parsing questions:', parseError)
          // Fallback questions
          parsedQuestions = [
            {
              question: `What did ${info.name} discover about ${randomTopic}?`,
              options: ["Something amazing", "Nothing special", "It was boring", "It was scary"],
              correctAnswer: 0,
              explanation: `${info.name} always discovers amazing things about science!`
            },
            {
              question: "Why is it important to learn about science?",
              options: ["It's not important", "To understand our world", "Only for adults", "It's too hard"],
              correctAnswer: 1,
              explanation: "Science helps us understand the amazing world around us!"
            },
            {
              question: `What should you do when you're curious about ${randomTopic}?`,
              options: ["Ignore it", "Ask questions and explore", "Be afraid", "Give up"],
              correctAnswer: 1,
              explanation: "Being curious and asking questions is how we learn new things!"
            }
          ]
          setQuestions(parsedQuestions)
        }

        // Cache the generated story
        cacheStory(userId, character, profile.age, randomTopic, {
          id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: storyTitle,
          content: storyText,
          scienceTopic: randomTopic,
          storyNumber,
          questions: parsedQuestions,
          createdAt: new Date().toISOString()
        })
      }

      // Handle image generation/caching
      if (cachedImage) {
        // Use cached image
        console.log('🖼️ Using cached image for:', randomTopic)
        setCacheHit(prev => ({ ...prev, image: true }))
        setMoodImage(cachedImage.url)
      } else {
        // Generate new image
        console.log('🎨 Generating new image for:', randomTopic)
        setIsGeneratingImage(true)
        try {
          const imagePrompt = `A black and white atmospheric illustration showing the environment for a children's science story about "${randomTopic}". The scene should be mysterious and educational, suitable for kids aged 6-10. Style: black and white sketch, atmospheric, child-friendly, educational mood. No text or characters, just the environment and setting.`
          
          const { data: imageData } = await blink.ai.generateImage({
            prompt: imagePrompt,
            size: '1024x1024',
            quality: 'high',
            n: 1
          })
          
          if (imageData && imageData[0]?.url) {
            imageUrl = imageData[0].url
            setMoodImage(imageUrl)
            
            // Cache the generated image
            cacheImage(userId, character, profile.age, randomTopic, imageUrl, imagePrompt)
          }
        } catch (imageError) {
          console.error('Error generating mood image:', imageError)
          // Continue without image if generation fails
        } finally {
          setIsGeneratingImage(false)
        }
      }

      // Save story to localStorage (for history)
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCurrentStoryId(storyId)
      
      const newStory: Story = {
        id: storyId,
        title: storyTitle,
        content: storyText,
        scienceTopic: randomTopic,
        storyNumber,
        questions: parsedQuestions,
        moodImage: imageUrl || cachedImage?.url || undefined,
        createdAt: new Date().toISOString()
      }

      // Get existing stories
      const existingStoriesForSave = localStorage.getItem(`stories_${userId}`)
      const stories = existingStoriesForSave ? JSON.parse(existingStoriesForSave) : []
      
      // Add new story
      stories.push(newStory)
      localStorage.setItem(`stories_${userId}`, JSON.stringify(stories))

    } catch (error) {
      console.error('Error generating story:', error)
      // Fallback story
      setStory(`Once upon a time, ${info.name} discovered something amazing about ${scienceTopic}! This is where an exciting adventure would unfold, teaching us wonderful things about science and nature. The story would be perfectly crafted for a ${profile.age}-year-old ${profile.gender} who loves to learn and explore!`)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateStory()
  }, [character, profile, storyNumber]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[questionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleSubmitAnswers = () => {
    setShowResults(true)
    
    // Mark story as completed and save answers
    const existingStoriesForUpdate = localStorage.getItem(`stories_${userId}`)
    if (existingStoriesForUpdate) {
      const stories = JSON.parse(existingStoriesForUpdate)
      const storyIndex = stories.findIndex((s: Story) => s.id === currentStoryId)
      if (storyIndex !== -1) {
        stories[storyIndex].answers = userAnswers.map(String)
        stories[storyIndex].completedAt = new Date().toISOString()
        localStorage.setItem(`stories_${userId}`, JSON.stringify(stories))
      }
    }
  }

  const handleNextStory = async () => {
    setIsGeneratingNext(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onNextStory()
  }

  const handleRegenerateStory = () => {
    // Force a completely new story by clearing any potential cache
    console.log('🔄 Force regenerating story...')
    generateStory()
  }

  const handleForceNewStory = () => {
    // Clear cache for this topic and generate completely new story
    console.log('🆕 Forcing completely new story generation...')
    setIsLoading(true)
    setShowResults(false)
    setUserAnswers([])
    setMoodImage('')
    setIsUsingCache(false)
    setCacheHit({ story: false, image: false })
    
    // Clear any existing cache for this topic
    const existingStoriesForForce = localStorage.getItem(`stories_${userId}`)
    const usedTopics = existingStoriesForForce ? JSON.parse(existingStoriesForForce).map((s: Story) => s.scienceTopic) : []
    
    // Force a different topic or same topic with new variation
    setTimeout(() => {
      generateStory()
    }, 100)
  }

  const getScore = () => {
    if (!showResults) return 0
    return userAnswers.reduce((score, answer, index) => {
      return score + (answer === questions[index]?.correctAnswer ? 1 : 0)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-4 border-primary/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${info.bgGradient} rounded-full flex items-center justify-center ${info.borderColor} border-4 animate-bounce-gentle`}>
              <span className="text-4xl">{info.emoji}</span>
            </div>
            <h3 className="text-2xl font-comic font-bold text-primary">
              {info.name} is creating your adventure...
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-lg font-comic text-gray-600">
              {isGeneratingImage 
                ? 'Creating the perfect mood image...' 
                : isUsingCache 
                ? 'Loading your cached adventure...' 
                : 'Preparing an amazing science story just for you!'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b-4 border-primary/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="font-comic hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-comic">
              Adventure #{storyNumber}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateStory}
                className="font-comic hover:bg-white/50"
                title="Generate a different story"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceNewStory}
                className="font-comic hover:bg-white/50 text-xs px-2"
                title="Force completely new story"
              >
                <Zap className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
          </div>
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
              <Sparkles className="h-8 w-8 text-primary animate-bounce-gentle" />
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-comic text-primary mb-2">
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="text-lg font-comic px-4 py-2">
                🔬 Learning about: {scienceTopic}
              </Badge>
              {(cacheHit.story || cacheHit.image) && (
                <Badge variant="secondary" className="text-sm font-comic px-3 py-1 bg-green-100 text-green-800 border-green-300">
                  <Zap className="h-3 w-3 mr-1" />
                  {cacheHit.story && cacheHit.image ? 'Instant Load' : cacheHit.story ? 'Story Cached' : 'Image Cached'}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-comic px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                🆔 Story #{storyNumber} | 📚 {scienceTopic ? scienceTopic.substring(0, 20) + '...' : 'Loading...'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Mood Image */}
        {moodImage && (
          <Card className="border-4 border-gray-300 bg-white/95 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={moodImage} 
                  alt={`Atmospheric scene for ${scienceTopic}`}
                  className="w-full h-64 md:h-80 object-cover filter grayscale"
                  style={{ 
                    filter: 'grayscale(100%) contrast(1.1) brightness(0.9)',
                    imageRendering: 'crisp-edges'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-comic bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    🎨 Setting the mood for your adventure...
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
                {story}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        {questions.length > 0 && (
          <Card className="border-4 border-accent/30 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl font-comic text-center text-gray-800">
                🤔 Test Your Knowledge!
              </CardTitle>
              <p className="text-center font-comic text-gray-600">
                Answer these questions about {info.name}'s adventure to complete the story!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-white/80 rounded-lg p-4 border-2 border-accent/20">
                  <h4 className="text-lg font-comic font-bold text-gray-800 mb-3">
                    Question {questionIndex + 1}: {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        disabled={showResults}
                        className={`w-full text-left p-3 rounded-lg border-2 font-comic transition-colors ${
                          showResults
                            ? optionIndex === question.correctAnswer
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : userAnswers[questionIndex] === optionIndex
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200'
                            : userAnswers[questionIndex] === optionIndex
                            ? `${info.buttonClass.replace('hover:', '')} text-white border-transparent`
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                          {showResults && (
                            <span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {userAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer && (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {showResults && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <p className="text-sm font-comic text-blue-800">
                        <strong>💡 Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {!showResults && userAnswers.length === questions.length && (
                <div className="text-center">
                  <Button
                    onClick={handleSubmitAnswers}
                    className={`${info.buttonClass} text-white font-comic text-lg px-6 py-3 rounded-lg`}
                  >
                    Submit Answers
                  </Button>
                </div>
              )}
              
              {showResults && (
                <div className="text-center space-y-4">
                  <div className="bg-white/90 rounded-lg p-4 border-2 border-primary/30">
                    <h4 className="text-xl font-comic font-bold text-primary mb-2">
                      🎉 Great Job!
                    </h4>
                    <p className="text-lg font-comic text-gray-700">
                      You got {getScore()} out of {questions.length} questions correct!
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {Array.from({ length: questions.length }, (_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            userAnswers[i] === questions[i]?.correctAnswer
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Adventure Button */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 border-4 border-yellow-300">
            <h4 className="text-2xl font-comic font-bold text-gray-800 mb-2">
              🌟 {showResults || questions.length === 0 ? 'Great job exploring with' : 'Complete the questions to finish your adventure with'} {info.name}!
            </h4>
            <p className="text-lg font-comic text-gray-700">
              {showResults || questions.length === 0 ? 'Ready for your next science adventure?' : 'Answer the questions above to unlock your next adventure!'}
            </p>
          </div>
          
          <Button
            onClick={handleNextStory}
            disabled={isGeneratingNext || (!showResults && questions.length > 0)}
            className={`${info.buttonClass} text-white font-comic text-xl px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              (!showResults && questions.length > 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            size="lg"
          >
            {isGeneratingNext ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Preparing next adventure...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                Next Adventure with {info.name}!
                <ArrowRight className="h-6 w-6" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}