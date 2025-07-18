import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Sparkles, BookOpen, Star } from 'lucide-react'

interface HomePageProps {
  onCharacterSelect: (character: 'sia' | 'raghav') => void
}

export function HomePage({ onCharacterSelect }: HomePageProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<'sia' | 'raghav' | null>(null)

  const handleCharacterClick = (character: 'sia' | 'raghav') => {
    setSelectedCharacter(character)
    setTimeout(() => {
      onCharacterSelect(character)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-bounce-gentle" />
            <BookOpen className="h-10 w-10 text-accent" />
            <Star className="h-8 w-8 text-primary animate-bounce-gentle" />
          </div>
          <h1 className="text-5xl md:text-6xl font-comic font-bold text-primary mb-4">
            Science Adventure Stories
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-comic">
            Learn about science and nature through exciting adventures!
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your adventure companion and embark on amazing journeys of discovery
          </p>
        </div>

        {/* Character Selection */}
        <div className="space-y-6 animate-slide-up">
          <h2 className="text-3xl font-comic font-bold text-gray-800">
            Choose Your Adventure Buddy!
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Sia Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 ${
                selectedCharacter === 'sia' 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-pink-300 hover:border-primary'
              }`}
              onClick={() => handleCharacterClick('sia')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center mb-4 border-4 border-pink-300">
                  <span className="text-6xl">👧🏻</span>
                </div>
                <CardTitle className="text-3xl font-comic text-pink-600">Sia</CardTitle>
                <CardDescription className="text-lg font-comic text-gray-600">
                  The Curious Explorer
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4 font-comic">
                  Sia loves discovering new things about nature and science. 
                  She's brave, smart, and always ready for an adventure!
                </p>
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-comic text-lg py-6"
                  size="lg"
                >
                  Adventure with Sia! 🌸
                </Button>
              </CardContent>
            </Card>

            {/* Raghav Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-4 ${
                selectedCharacter === 'raghav' 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-blue-300 hover:border-primary'
              }`}
              onClick={() => handleCharacterClick('raghav')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-200 to-green-200 rounded-full flex items-center justify-center mb-4 border-4 border-blue-300">
                  <span className="text-6xl">👦🏻</span>
                </div>
                <CardTitle className="text-3xl font-comic text-blue-600">Raghav</CardTitle>
                <CardDescription className="text-lg font-comic text-gray-600">
                  The Science Detective
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4 font-comic">
                  Raghav is fascinated by how things work and loves solving mysteries. 
                  He's clever, kind, and full of amazing questions!
                </p>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-comic text-lg py-6"
                  size="lg"
                >
                  Adventure with Raghav! 🔬
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 font-comic animate-fade-in">
          <p>Perfect for kids aged 6-10 years old</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="h-4 w-4 text-accent" />
            <span>Educational • Fun • Safe</span>
            <Star className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>
    </div>
  )
}