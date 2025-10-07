import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share, Settings, User, Home, Search, PlusSquare, Moon, Sun, Play, Pause, ChevronLeft, ChevronRight, X, Plus, Key, Shield, Lock, Image as ImageIcon, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { UserCrypto, LocalStorage } from './crypto.js'
import './App.css'

// Componente de Layout Principal
function Layout({ children, currentUser, darkMode, toggleDarkMode, onLogout }) {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Pixter
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-accent/50 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {currentUser && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Sair
                </Button>
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      {currentUser && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              {[
                { id: 'home', icon: Home, label: 'Feed' },
                { id: 'search', icon: Search, label: 'Explorar' },
                { id: 'create', icon: PlusSquare, label: 'Criar' },
                { id: 'profile', icon: User, label: 'Perfil' },
                { id: 'settings', icon: Settings, label: 'Config' }
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}

// Componente de Login/Cadastro
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        // Login de usuário existente
        const userData = LocalStorage.loadUserData(formData.username)
        if (!userData) {
          setError('Usuário não encontrado. Crie uma conta primeiro.')
          return
        }

        const userCrypto = await UserCrypto.load(userData, formData.password)
        
        onLogin({
          id: userData.username,
          name: formData.username,
          username: formData.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
          bio: 'Usuário do Pixter 🔐',
          crypto: userCrypto,
          publicKey: userCrypto.keyPair.getPublicKeyBase64(),
          created: userData.created
        })
      } else {
        // Cadastro de novo usuário
        const existingUser = LocalStorage.loadUserData(formData.username)
        if (existingUser) {
          setError('Nome de usuário já existe. Escolha outro.')
          return
        }

        setSuccess('Gerando chaves criptográficas...')
        
        const { userCrypto, userData } = await UserCrypto.create(formData.username, formData.password)
        LocalStorage.saveUserData(formData.username, userData)
        
        setSuccess('Conta criada com sucesso! Fazendo login...')
        
        setTimeout(() => {
          onLogin({
            id: userData.username,
            name: formData.username,
            username: formData.username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
            bio: 'Novo no Pixter 🌟',
            crypto: userCrypto,
            publicKey: userCrypto.keyPair.getPublicKeyBase64(),
            created: userData.created
          })
        }, 1500)
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Pixter
                </h1>
              </div>
              <p className="text-muted-foreground mb-2">
                {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Criptografia Ed25519 + ChaCha20</span>
              </div>
            </div>

            {error && (
              <Alert className="mb-4 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-500/50 text-green-600">
                <AlertDescription className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="rounded-xl border-border/50 focus:border-primary/50"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-xl border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirmar senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="rounded-xl border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </div>
                ) : (
                  isLogin ? 'Entrar' : 'Criar conta'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-muted-foreground hover:text-primary"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Componente de Story Individual
function StoryItem({ story, onClick, isOwn = false }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 cursor-pointer"
      onClick={() => onClick(story)}
    >
      <div className={`relative ${isOwn ? 'story-ring-add' : story.viewed ? 'story-ring-viewed' : 'story-ring-new'}`}>
        <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background">
          <AvatarImage src={story.user.avatar} />
          <AvatarFallback>{story.user.name[0]}</AvatarFallback>
        </Avatar>
        {isOwn && (
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>
      <span className="text-xs text-center max-w-[70px] truncate">
        {isOwn ? 'Seu story' : story.user.name}
      </span>
    </motion.div>
  )
}

// Componente de Stories Horizontais
function StoriesBar({ stories, currentUser, onStoryClick, onAddStory }) {
  return (
    <div className="mb-6">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Adicionar Story */}
        <StoryItem
          story={{
            user: currentUser,
            isAdd: true
          }}
          onClick={onAddStory}
          isOwn={true}
        />
        
        {/* Stories dos usuários */}
        {stories.map((story) => (
          <StoryItem
            key={story.id}
            story={story}
            onClick={onStoryClick}
          />
        ))}
      </div>
    </div>
  )
}

// Componente de Visualização de Story
function StoryViewer({ stories, currentStoryIndex, onClose, onNext, onPrev }) {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const currentStory = stories[currentStoryIndex]

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onNext()
          return 0
        }
        return prev + 1
      })
    }, 50) // 5 segundos total (100 * 50ms)

    return () => clearInterval(timer)
  }, [isPlaying, onNext])

  useEffect(() => {
    setProgress(0)
  }, [currentStoryIndex])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Header com progresso */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-1 mb-4">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-white/20">
              <AvatarImage src={currentStory.user.avatar} />
              <AvatarFallback>{currentStory.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm">{currentStory.user.name}</p>
              <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Imagem do Story */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentStory.image}
          alt={currentStory.caption}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Legenda */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-center bg-black/50 rounded-lg p-3">
              {currentStory.caption}
            </p>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        disabled={currentStoryIndex === 0}
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        disabled={currentStoryIndex === stories.length - 1}
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Área clicável para navegação */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={onPrev} />
        <div className="flex-1" onClick={onNext} />
      </div>
    </motion.div>
  )
}

// Componente de Post
function Post({ post, onLike, onComment, isLiked, comments, showComments, onToggleComments }) {
  const [newComment, setNewComment] = useState('')

  const handleLike = () => {
    onLike(post.id)
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment)
      setNewComment('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0">
          {/* Header do Post */}
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{post.user.name}</h3>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>

          {/* Imagem do Post */}
          {post.image && (
            <div className="relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.caption}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Ações do Post */}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleComments}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>

            {/* Curtidas */}
            <p className="text-sm font-semibold mb-2">
              {post.likes} curtida{post.likes !== 1 ? 's' : ''}
            </p>

            {/* Legenda */}
            {post.caption && (
              <p className="text-sm mb-2">
                <span className="font-semibold">{post.user.name}</span>{' '}
                {post.caption}
              </p>
            )}

            {/* Comentários */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-2"
                >
                  {comments?.map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <span className="font-semibold">{comment.user}</span>{' '}
                      {comment.text}
                      <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Adicione um comentário..."
                      className="flex-1 rounded-full border-border/50 text-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <Button 
                      size="sm" 
                      className="rounded-full"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      Enviar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Componente do Feed
function Feed({ currentUser }) {
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: {
        name: 'Ana Silva',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana'
      },
      image: 'https://picsum.photos/600/600?random=1',
      caption: 'Aproveitando o dia ensolarado! ☀️',
      likes: 42,
      timestamp: '2h',
      comments: [
        { user: 'João', text: 'Que foto linda!' },
        { user: 'Maria', text: 'Adorei! 😍' }
      ]
    },
    {
      id: '2',
      user: {
        name: 'Carlos Santos',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos'
      },
      image: 'https://picsum.photos/600/600?random=2',
      caption: 'Novo projeto finalizado! 🚀',
      likes: 28,
      timestamp: '4h',
      comments: []
    }
  ])

  const [stories] = useState([
    {
      id: '1',
      user: {
        name: 'Ana Silva',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana'
      },
      image: 'https://picsum.photos/400/700?random=10',
      caption: 'Bom dia! ☀️',
      timestamp: '1h',
      viewed: false
    },
    {
      id: '2',
      user: {
        name: 'Carlos Santos',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos'
      },
      image: 'https://picsum.photos/400/700?random=11',
      caption: 'Trabalhando no novo projeto',
      timestamp: '3h',
      viewed: true
    },
    {
      id: '3',
      user: {
        name: 'Maria Costa',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
      },
      image: 'https://picsum.photos/400/700?random=12',
      caption: 'Café da manhã perfeito! ☕',
      timestamp: '5h',
      viewed: false
    }
  ])

  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ caption: '', image: null })
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [comments, setComments] = useState({})
  const [showComments, setShowComments] = useState({})

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
      }
      return newLiked
    })
  }

  const handleComment = (postId, comment) => {
    if (comment.trim()) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), {
          id: Date.now(),
          user: currentUser.name,
          text: comment,
          timestamp: 'agora'
        }]
      }))
    }
  }

  const handleCreatePost = async () => {
    if (newPost.caption.trim() || newPost.image) {
      const post = {
        id: Date.now().toString(),
        user: {
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        image: newPost.image || `https://picsum.photos/600/600?random=${Date.now()}`,
        caption: newPost.caption,
        likes: 0,
        timestamp: 'agora',
        comments: []
      }
      
      setPosts(prev => [post, ...prev])
      setNewPost({ caption: '', image: null })
      setShowCreatePost(false)
    }
  }



  const handleStoryClick = (story) => {
    const storyIndex = stories.findIndex(s => s.id === story.id)
    setCurrentStoryIndex(storyIndex)
    setShowStoryViewer(true)
  }

  const handleAddStory = () => {
    console.log('Adicionar novo story')
    // Aqui seria implementada a lógica para adicionar um novo story
  }

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else {
      setShowStoryViewer(false)
    }
  }

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    }
  }

  const handleCloseStory = () => {
    setShowStoryViewer(false)
  }

  return (
    <div className="pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stories Bar */}
        <StoriesBar
          stories={stories}
          currentUser={currentUser}
          onStoryClick={handleStoryClick}
          onAddStory={handleAddStory}
        />

        {/* Botão de Criar Post */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-muted-foreground"
                onClick={() => setShowCreatePost(true)}
              >
                O que você está pensando, {currentUser.name?.split(' ')[0]}?
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowCreatePost(true)}
                className="text-primary hover:bg-primary/10"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Posts Feed */}
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            isLiked={likedPosts.has(post.id)}
            comments={comments[post.id] || []}
            showComments={showComments[post.id]}
            onToggleComments={() => setShowComments(prev => ({
              ...prev,
              [post.id]: !prev[post.id]
            }))}
          />
        ))}
      </motion.div>

      {/* Story Viewer */}
      <AnimatePresence>
        {showStoryViewer && (
          <StoryViewer
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            onClose={handleCloseStory}
            onNext={handleNextStory}
            onPrev={handlePrevStory}
          />
        )}
      </AnimatePresence>

      {/* Modal de Criar Post */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              className="bg-background rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Criar Post</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreatePost(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-sm text-muted-foreground">Público</p>
                  </div>
                </div>

                <textarea
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="O que você está pensando?"
                  rows={4}
                  value={newPost.caption}
                  onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                />

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Foto
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4 mr-2" />
                      Emoji
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.caption.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente Principal do App
function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem('pixter_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Verificar se os dados do usuário são válidos
        if (userData && userData.username && userData.id) {
          setCurrentUser(userData)
        } else {
          // Remover dados inválidos
          localStorage.removeItem('pixter_user')
        }
      } catch (error) {
        // Remover dados corrompidos
        localStorage.removeItem('pixter_user')
      }
    }

    // Verificar preferência de tema
    const savedTheme = localStorage.getItem('pixter_theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    }
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
    // Salva apenas dados básicos do usuário, não a instância de criptografia
    const userToSave = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      publicKey: user.publicKey,
      created: user.created
    }
    localStorage.setItem('pixter_user', JSON.stringify(userToSave))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('pixter_user')
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('pixter_theme', newMode ? 'dark' : 'light')
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout 
        currentUser={currentUser} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Feed currentUser={currentUser} />} />
          <Route path="/feed" element={<Feed currentUser={currentUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
