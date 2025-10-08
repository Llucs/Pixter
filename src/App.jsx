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
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </motion.div>
  )
}

// Componente de Post
function Post({ post, onLike, onComment, onShare }) {
  return (
    <Card className="mb-6 overflow-hidden border-border/50 shadow-sm">
      {/* Header do Post */}
      <div className="p-4 flex items-center gap-3 bg-background/50">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={post.user.avatar} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
        </div>
      </div>

      {/* Imagem do Post */}
      <div className="bg-muted/50">
        <img src={post.image} alt={post.caption} className="w-full h-auto object-cover" />
      </div>

      {/* Ações e Legenda */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <motion.button whileTap={{ scale: 1.2 }} onClick={() => onLike(post.id)}>
              <Heart className={`h-6 w-6 ${post.liked ? 'text-red-500 fill-current' : 'text-foreground'}`} />
            </motion.button>
            <motion.button whileTap={{ scale: 1.2 }} onClick={() => onComment(post.id)}>
              <MessageCircle className="h-6 w-6 text-foreground" />
            </motion.button>
            <motion.button whileTap={{ scale: 1.2 }} onClick={() => onShare(post.id)}>
              <Share className="h-6 w-6 text-foreground" />
            </motion.button>
          </div>
        </div>
        
        <p className="text-sm mb-2">
          <span className="font-semibold">{post.likes}</span> curtidas
        </p>
        
        <p className="text-sm">
          <span className="font-semibold mr-2">{post.user.name}</span>
          {post.caption}
        </p>

        <p className="text-xs text-muted-foreground mt-3 cursor-pointer hover:underline">
          Ver todos os {post.comments.length} comentários
        </p>
      </div>
    </Card>
  )
}

// Componente de Feed Principal
function Feed({ posts, onLike, onComment, onShare }) {
  return (
    <div>
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
        />
      ))}
    </div>
  )
}

// Componente de Criação de Post
function CreatePost({ currentUser, onPostCreated }) {
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isPosting, setIsPosting] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || !caption) {
      alert("Por favor, adicione uma imagem e uma legenda.")
      return
    }

    setIsPosting(true)

    // Simulação de upload e criação de post
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        user: currentUser,
        image: imagePreview,
        caption: caption,
        timestamp: "agora mesmo",
        likes: 0,
        liked: false,
        comments: []
      }
      onPostCreated(newPost)
      setIsPosting(false)
      setCaption("")
      setImage(null)
      setImagePreview(null)
    }, 1500)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Criar nova publicação</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Pré-visualização" className="w-full rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>Arraste uma imagem ou clique para selecionar</p>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-xl border-border/50 focus:border-primary/50"
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPosting || !image || !caption}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPosting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publicando...
              </div>
            ) : (
              'Publicar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente de Perfil
function ProfilePage({ user, posts }) {
  const userPosts = posts.filter(p => p.user.id === user.id)

  return (
    <div>
      {/* Header do Perfil */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <Avatar className="h-32 w-32 ring-4 ring-primary/30">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">@{user.username}</p>
          <p className="mt-2 max-w-md">{user.bio}</p>
          <div className="flex justify-center md:justify-start gap-6 mt-4 text-sm">
            <div><span className="font-bold">{userPosts.length}</span> publicações</div>
            <div><span className="font-bold">1,234</span> seguidores</div>
            <div><span className="font-bold">567</span> seguindo</div>
          </div>
        </div>
      </div>

      {/* Galeria de Posts */}
      <div className="grid grid-cols-3 gap-1">
        {userPosts.map(post => (
          <motion.div 
            key={post.id} 
            className="relative aspect-square overflow-hidden cursor-pointer"
            whileHover={{ opacity: 0.8 }}
          >
            <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likes}</div>
                <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments.length}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Componente de Configurações
function SettingsPage({ darkMode, toggleDarkMode }) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Configurações</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <span className="font-medium">Modo Escuro</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <span className="font-medium">Chave Pública</span>
            </div>
            <Button variant="outline" size="sm">Copiar</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Segurança da Conta</span>
            </div>
            <Button variant="outline" size="sm">Gerenciar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente Principal da Aplicação
function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [activeStory, setActiveStory] = useState(null)

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenta carregar o usuário da sessão
        const sessionUser = LocalStorage.loadSession()
        if (sessionUser) {
          const userData = LocalStorage.loadUserData(sessionUser.username)
          if (userData) {
            const userCrypto = await UserCrypto.load(userData, sessionUser.password) // Assume que a senha está na sessão
            setCurrentUser({
              id: userData.username,
              name: sessionUser.username,
              username: sessionUser.username,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.username}`,
              bio: 'De volta ao Pixter! 🚀',
              crypto: userCrypto,
              publicKey: userCrypto.keyPair.getPublicKeyBase64(),
              created: userData.created
            })
          }
        }

        // Carregar posts e stories de um arquivo JSON (simulação)
        const response = await fetch('/index.json')
        if (!response.ok) {
          throw new Error('Não foi possível carregar os dados iniciais.')
        }
        const data = await response.json()
        setPosts(data.posts || [])
        setStories(data.stories || [])
      } catch (err) {
        setError(err.message)
        console.error("Erro ao carregar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Gerenciar modo escuro
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
    LocalStorage.saveSession(user.username, user.crypto.password) // Salva na sessão
  }

  const handleLogout = () => {
    setCurrentUser(null)
    LocalStorage.clearSession()
  }

  const handleLike = (postId) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ))
  }

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
    // Aqui você adicionaria a lógica para salvar o post criptografado
  }

  const handleStoryClick = (story) => {
    const storyIndex = stories.findIndex(s => s.id === story.id)
    if (storyIndex !== -1) {
      setActiveStory(storyIndex)
      // Marcar story como visto
      setStories(stories.map(s => s.id === story.id ? { ...s, viewed: true } : s))
    }
  }

  const handleNextStory = () => {
    if (activeStory < stories.length - 1) {
      setActiveStory(activeStory + 1)
    } else {
      setActiveStory(null)
    }
  }

  const handlePrevStory = () => {
    if (activeStory > 0) {
      setActiveStory(activeStory - 1)
    } else {
      setActiveStory(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando Pixter...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert className="max-w-md border-destructive/50 text-destructive">
          <AlertDescription className="text-center">
            <h3 className="font-bold mb-2">Ocorreu um erro</h3>
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Router basename="/Pixter">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Layout currentUser={currentUser} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout}>
              <StoriesBar 
                stories={stories} 
                currentUser={currentUser} 
                onStoryClick={handleStoryClick}
                onAddStory={() => alert('Funcionalidade de adicionar story em breve!')}
              />
              <Routes>
                <Route path="/" element={<Feed posts={posts} onLike={handleLike} />} />
                <Route path="/profile" element={<ProfilePage user={currentUser} posts={posts} />} />
                <Route path="/create" element={<CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />} />
                <Route path="/settings" element={<SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStory !== null && (
          <StoryViewer 
            stories={stories}
            currentStoryIndex={activeStory}
            onClose={() => setActiveStory(null)}
            onNext={handleNextStory}
            onPrev={handlePrevStory}
          />
        )}
      </AnimatePresence>
    </Router>
  )
}

export default App

