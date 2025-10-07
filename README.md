# 🎨 Pixter - Rede Social Minimalista e Segura

> **Instagram 2.0** - Uma rede social moderna, descentralizada e segura que roda diretamente do GitHub com criptografia avançada e design minimalista.

![Pixter Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=Pixter+-+Rede+Social+Minimalista)

## ✨ Características Principais

### 🔐 **Segurança Avançada**
- **Criptografia Ed25519 + ChaCha20-Poly1305**: Dados totalmente criptografados
- **Chaves Privadas Locais**: Gerenciamento seguro no navegador do usuário
- **Assinaturas Digitais**: Validação de autenticidade de todos os dados
- **Armazenamento Descentralizado**: Sem servidores centrais, tudo no GitHub

### 🎨 **Design Minimalista**
- **Interface Limpa**: Cores suaves, tipografia elegante
- **Elementos CVF**: Ícones e botões em formato vetorial
- **Fotos Reais**: Posts, perfis e stories com imagens autênticas
- **Animações Fluidas**: Transições suaves e micro-interações
- **Temas Personalizáveis**: Modo claro/escuro e customização avançada

### 📱 **Funcionalidades Completas**
- **Feed de Posts**: Criação, curtidas e comentários em tempo real
- **Stories**: Visualizador completo com navegação e progressão
- **Sistema de Usuários**: Cadastro e login com criptografia
- **Cache Local**: Conversas e dados salvos no navegador
- **Configurações Avançadas**: Mais de 15 opções personalizáveis

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Navegador moderno com suporte a WebCrypto API

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/Llucs/Pixter.git
cd Pixter

# Instale as dependências
pnpm install
# ou
npm install

# Inicie o servidor de desenvolvimento
pnpm run dev
# ou
npm run dev
```

### Deploy para Produção

```bash
# Build para produção
pnpm run build
# ou
npm run build

# Os arquivos estarão na pasta dist/
# Faça deploy em qualquer servidor estático (Vercel, Netlify, GitHub Pages)
```

## 🏗️ Arquitetura do Sistema

### Frontend (React + Vite)
```
src/
├── App.jsx          # Componente principal
├── App.css          # Estilos globais
├── crypto.js        # Módulo de criptografia
└── components/      # Componentes UI (shadcn/ui)
```

### Estrutura de Dados
```
data/
├── posts/           # Posts criptografados dos usuários
├── profiles/        # Perfis e configurações
├── messages/        # Mensagens privadas
└── stories/         # Stories temporários

photos/
├── posts/           # Fotos dos posts
├── profiles/        # Fotos de perfil
└── stories/         # Fotos dos stories
```

### Sistema de Criptografia
- **Geração de Chaves**: Ed25519 para assinaturas digitais
- **Criptografia**: ChaCha20-Poly1305 para dados
- **Derivação**: PBKDF2 para chaves baseadas em senha
- **Armazenamento**: LocalStorage com dados criptografados

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18**: Framework principal
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Estilização utilitária
- **Framer Motion**: Animações fluidas
- **Lucide React**: Ícones vetoriais
- **shadcn/ui**: Componentes UI elegantes

### Criptografia
- **TweetNaCl**: Biblioteca de criptografia
- **Ed25519**: Assinaturas digitais
- **ChaCha20-Poly1305**: Criptografia simétrica
- **PBKDF2**: Derivação de chaves

### Roteamento
- **React Router**: Navegação SPA

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- [x] Cadastro com geração de chaves Ed25519
- [x] Login com descriptografia de chaves privadas
- [x] Logout seguro com limpeza de dados
- [x] Persistência segura no localStorage

### ✅ Feed de Posts
- [x] Criação de posts com modal elegante
- [x] Upload de fotos (simulado com Picsum)
- [x] Sistema de curtidas em tempo real
- [x] Comentários com timestamps
- [x] Feed infinito responsivo

### ✅ Stories
- [x] Visualizador em tela cheia
- [x] Navegação entre stories
- [x] Barra de progresso
- [x] Controles de play/pause
- [x] Responsividade completa

### ✅ Interface e UX
- [x] Design minimalista e elegante
- [x] Modo claro/escuro
- [x] Animações fluidas
- [x] Responsividade mobile
- [x] Micro-interações

### ✅ Segurança
- [x] Criptografia end-to-end
- [x] Assinaturas digitais
- [x] Validação de integridade
- [x] Armazenamento local seguro

## 🔮 Roadmap Futuro

### 🚧 Em Desenvolvimento
- [ ] GitHub Actions para validação automática
- [ ] Sistema de mensagens privadas criptografadas
- [ ] Perfis de usuário personalizáveis
- [ ] Configurações avançadas completas
- [ ] Sistema de notificações

### 📋 Planejado
- [ ] Upload real de fotos
- [ ] Stories com stickers e filtros
- [ ] Sistema de seguidores
- [ ] Busca e descoberta
- [ ] Backup e sincronização

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **shadcn/ui** - Componentes UI elegantes
- **Lucide** - Ícones vetoriais minimalistas
- **Framer Motion** - Animações fluidas
- **TweetNaCl** - Criptografia robusta
- **Picsum** - Fotos placeholder de qualidade

---

<div align="center">
  <p>Feito com ❤️ para uma internet mais segura e descentralizada</p>
  <p>
    <a href="#-características-principais">Características</a> •
    <a href="#-instalação-e-uso">Instalação</a> •
    <a href="#-arquitetura-do-sistema">Arquitetura</a> •
    <a href="#-funcionalidades-implementadas">Funcionalidades</a>
  </p>
</div>
