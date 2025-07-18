import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ArrowLeft, User, Calendar } from 'lucide-react'

interface ProfileFormProps {
  character: 'sia' | 'raghav'
  onBack: () => void
  onComplete: (profile: { gender: string; age: number }) => void
}

export function ProfileForm({ character, onBack, onComplete }: ProfileFormProps) {
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const characterInfo = {
    sia: {
      name: 'Sia',
      emoji: '👧🏻',
      color: 'pink',
      bgGradient: 'from-pink-200 to-purple-200',
      borderColor: 'border-pink-300'
    },
    raghav: {
      name: 'Raghav',
      emoji: '👦🏻',
      color: 'blue',
      bgGradient: 'from-blue-200 to-green-200',
      borderColor: 'border-blue-300'
    }
  }

  const info = characterInfo[character]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gender || !age) return

    setIsSubmitting(true)
    
    // Simulate form processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onComplete({
      gender,
      age: parseInt(age)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 font-comic text-lg hover:bg-white/50"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Choose Different Character
        </Button>

        <Card className="border-4 border-primary/30 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${info.bgGradient} rounded-full flex items-center justify-center mb-4 ${info.borderColor} border-4`}>
              <span className="text-5xl">{info.emoji}</span>
            </div>
            <CardTitle className="text-3xl font-comic text-primary">
              Let's Get to Know You!
            </CardTitle>
            <CardDescription className="text-lg font-comic text-gray-600">
              {info.name} is excited to go on adventures with you!
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender Selection */}
              <div className="space-y-3">
                <Label htmlFor="gender" className="text-lg font-comic text-gray-700 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  I am a...
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="h-12 text-lg font-comic border-2">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="girl" className="text-lg font-comic">Girl 👧</SelectItem>
                    <SelectItem value="boy" className="text-lg font-comic">Boy 👦</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Selection */}
              <div className="space-y-3">
                <Label htmlFor="age" className="text-lg font-comic text-gray-700 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  I am ... years old
                </Label>
                <Select value={age} onValueChange={setAge} required>
                  <SelectTrigger className="h-12 text-lg font-comic border-2">
                    <SelectValue placeholder="Choose your age" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10].map((ageOption) => (
                      <SelectItem key={ageOption} value={ageOption.toString()} className="text-lg font-comic">
                        {ageOption} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!gender || !age || isSubmitting}
                className={`w-full h-14 text-xl font-comic ${
                  info.color === 'pink' 
                    ? 'bg-pink-500 hover:bg-pink-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up your adventure...
                  </div>
                ) : (
                  `Start Adventures with ${info.name}! ✨`
                )}
              </Button>
            </form>

            {/* Fun Message */}
            <div className="mt-6 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300">
              <p className="text-center font-comic text-gray-700">
                🌟 Don't worry, this information helps {info.name} create the perfect adventures just for you!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}