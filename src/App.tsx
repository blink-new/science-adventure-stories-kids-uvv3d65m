import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { HomePage } from './components/HomePage'
import { ProfileForm } from './components/ProfileForm'
import { Dashboard } from './components/Dashboard'
import { StoryReader } from './components/StoryReader'
import { StoryHistory } from './components/StoryHistory'

type AppState = 'loading' | 'home' | 'profile' | 'dashboard' | 'story' | 'history'

interface UserProfile {
  character: 'sia' | 'raghav'
  gender: string
  age: number
}

function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [storyNumber, setStoryNumber] = useState(1)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        // Check if user has a profile
        const savedProfile = localStorage.getItem(`profile_${state.user.id}`)
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile))
          setAppState('dashboard')
        } else {
          setAppState('home')
        }
      } else {
        setAppState('home')
      }
    })

    return unsubscribe
  }, [])

  const handleCharacterSelect = (character: 'sia' | 'raghav') => {
    setUserProfile(prev => ({ ...prev, character } as UserProfile))
    setAppState('profile')
  }

  const handleProfileComplete = (profile: { gender: string; age: number }) => {
    if (!userProfile?.character) return
    
    const completeProfile: UserProfile = {
      character: userProfile.character,
      gender: profile.gender,
      age: profile.age
    }
    
    setUserProfile(completeProfile)
    
    // Save to localStorage (in a real app, this would be saved to database)
    if (user) {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(completeProfile))
    }
    
    setAppState('dashboard')
  }

  const handleStartAdventure = () => {
    setAppState('story')
  }

  const handleViewHistory = () => {
    setAppState('history')
  }

  const handleBackToDashboard = () => {
    setAppState('dashboard')
  }

  const handleNextStory = () => {
    setStoryNumber(prev => prev + 1)
    // Stay in story state to generate new story
  }

  const handleLogout = () => {
    blink.auth.logout()
    setUserProfile(null)
    setStoryNumber(1)
    setAppState('home')
  }

  const handleBackToHome = () => {
    setUserProfile(null)
    setAppState('home')
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center animate-bounce-gentle">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-2xl font-comic font-bold text-primary">
            Loading your adventure...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Render appropriate component based on app state
  switch (appState) {
    case 'home':
      return <HomePage onCharacterSelect={handleCharacterSelect} />
    
    case 'profile':
      return (
        <ProfileForm
          character={userProfile!.character}
          onBack={handleBackToHome}
          onComplete={handleProfileComplete}
        />
      )
    
    case 'dashboard':
      return (
        <Dashboard
          character={userProfile!.character}
          profile={userProfile!}
          userId={user!.id}
          onStartAdventure={handleStartAdventure}
          onViewHistory={handleViewHistory}
          onLogout={handleLogout}
        />
      )
    
    case 'story':
      return (
        <StoryReader
          character={userProfile!.character}
          profile={userProfile!}
          storyNumber={storyNumber}
          userId={user!.id}
          onBack={handleBackToDashboard}
          onNextStory={handleNextStory}
        />
      )
    
    case 'history':
      return (
        <StoryHistory
          character={userProfile!.character}
          profile={userProfile!}
          userId={user!.id}
          onBack={handleBackToDashboard}
          onReadStory={(story) => {
            // Could implement reading a specific story here
            console.log('Reading story:', story)
          }}
        />
      )
    
    default:
      return <HomePage onCharacterSelect={handleCharacterSelect} />
  }
}

export default App