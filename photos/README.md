# 📸 Estrutura de Fotos do Pixter

Este diretório contém todas as fotos reais enviadas pelos usuários do Pixter. Todas as fotos são criptografadas antes de serem armazenadas no repositório.

## 📂 Organização dos Diretórios

### `posts/`
Fotos dos posts dos usuários.

**Estrutura:**
```
posts/
├── usuario1_post_001.jpg.enc    # Foto do post criptografada
├── usuario1_post_002.png.enc
├── usuario2_post_001.jpg.enc
└── ...
```

### `profiles/`
Fotos de perfil dos usuários.

**Estrutura:**
```
profiles/
├── usuario1_avatar.jpg.enc      # Foto de perfil criptografada
├── usuario2_avatar.png.enc
└── ...
```

### `stories/`
Fotos dos stories temporários.

**Estrutura:**
```
stories/
├── usuario1_story_001.jpg.enc   # Foto do story criptografada
├── usuario1_story_002.png.enc
└── ...
```

## 🔐 Criptografia de Fotos

### Processo de Upload
1. **Seleção da Foto:** Usuário seleciona foto no frontend
2. **Redimensionamento:** Foto é redimensionada para otimização
3. **Criptografia:** Foto é criptografada com ChaCha20-Poly1305
4. **Assinatura:** Arquivo criptografado é assinado com Ed25519
5. **Upload:** Arquivo `.enc` é commitado no repositório

### Formato dos Arquivos

**Nome do arquivo:**
- Posts: `{username}_post_{id}.{ext}.enc`
- Perfis: `{username}_avatar.{ext}.enc`
- Stories: `{username}_story_{id}.{ext}.enc`

**Estrutura interna:**
```json
{
  "version": "1.0",
  "algorithm": "ChaCha20-Poly1305",
  "nonce": "base64_encoded_nonce",
  "ciphertext": "base64_encoded_encrypted_image",
  "signature": "ed25519_signature",
  "public_key": "ed25519_public_key",
  "metadata": {
    "original_name": "photo.jpg",
    "mime_type": "image/jpeg",
    "size": 1024000,
    "dimensions": {
      "width": 1080,
      "height": 1080
    },
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

## 🎨 Processamento de Imagens

### Redimensionamento Automático
- **Posts:** Máximo 1080x1080px
- **Perfis:** 400x400px (circular)
- **Stories:** 1080x1920px (9:16)

### Formatos Suportados
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ❌ GIF (convertido para WebP)

### Otimização
- Compressão automática para reduzir tamanho
- Conversão para WebP quando possível
- Remoção de metadados EXIF por privacidade

## 🔄 Descriptografia e Exibição

### No Frontend
1. **Download:** Arquivo `.enc` é baixado do repositório
2. **Verificação:** Assinatura Ed25519 é validada
3. **Descriptografia:** Conteúdo é descriptografado com chave do usuário
4. **Exibição:** Imagem é exibida como blob URL temporário

### Cache Local
- Imagens descriptografadas são cacheadas no navegador
- Cache é limpo automaticamente após logout
- Apenas o usuário pode ver suas próprias fotos

## 🛡️ Segurança e Privacidade

### Proteções Implementadas
- **Criptografia End-to-End:** Fotos nunca são visíveis em texto plano
- **Assinaturas Digitais:** Validação de integridade e autenticidade
- **Isolamento de Usuários:** Cada usuário só acessa suas fotos
- **Remoção de Metadados:** EXIF removido para proteger localização

### Validações do GitHub Actions
- Verificação de formato dos arquivos `.enc`
- Validação de assinaturas digitais
- Controle de permissões por usuário
- Detecção de conteúdo malicioso

## 📱 Integração com o Frontend

### Upload de Fotos
```javascript
// Exemplo de upload de foto
const uploadPhoto = async (file, type) => {
  const resized = await resizeImage(file, type);
  const encrypted = await encryptImage(resized);
  const signed = await signData(encrypted);
  await commitToGitHub(signed);
};
```

### Exibição de Fotos
```javascript
// Exemplo de exibição de foto
const displayPhoto = async (filename) => {
  const encrypted = await fetchFromGitHub(filename);
  const verified = await verifySignature(encrypted);
  const decrypted = await decryptImage(verified);
  return createBlobURL(decrypted);
};
```

## ⚠️ Limitações e Considerações

### Tamanho dos Arquivos
- **Máximo por foto:** 5MB antes da criptografia
- **Recomendado:** 1-2MB para melhor performance
- **Stories:** Máximo 3MB (temporários)

### Performance
- Criptografia/descriptografia pode ser lenta em dispositivos antigos
- Cache local melhora performance de carregamento
- Lazy loading implementado para feeds grandes

### Backup e Recuperação
- Usuários devem fazer backup de suas chaves privadas
- Perda da chave = perda permanente das fotos
- Não há recuperação de senha/chave pelo sistema
