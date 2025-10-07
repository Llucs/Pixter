# 📁 Estrutura de Dados do Pixter

Este diretório contém todos os dados criptografados dos usuários do Pixter. Cada arquivo é criptografado com a chave privada do usuário e assinado digitalmente para garantir integridade.

## 📂 Organização dos Diretórios

### `posts/`
Contém os posts de cada usuário em formato criptografado.

**Estrutura:**
```
posts/
├── usuario1_post_001.enc    # Post criptografado
├── usuario1_post_002.enc
├── usuario2_post_001.enc
└── ...
```

**Formato do arquivo:**
- **Nome:** `{username}_post_{id}.enc`
- **Conteúdo:** JSON criptografado com ChaCha20-Poly1305
- **Assinatura:** Ed25519 para validação de integridade

### `profiles/`
Contém os perfis e configurações dos usuários.

**Estrutura:**
```
profiles/
├── usuario1_profile.enc     # Perfil criptografado
├── usuario1_settings.enc    # Configurações do usuário
├── usuario2_profile.enc
└── ...
```

**Formato do arquivo:**
- **Nome:** `{username}_profile.enc` ou `{username}_settings.enc`
- **Conteúdo:** JSON criptografado com dados do perfil/configurações

### `messages/`
Contém as conversas privadas entre usuários.

**Estrutura:**
```
messages/
├── usuario1_usuario2_001.enc    # Conversa criptografada
├── usuario1_usuario3_001.enc
└── ...
```

**Formato do arquivo:**
- **Nome:** `{user1}_{user2}_{conversation_id}.enc`
- **Conteúdo:** Array de mensagens criptografadas

## 🔐 Segurança e Criptografia

### Processo de Criptografia
1. **Geração de Chaves:** Cada usuário gera um par Ed25519 (pública/privada)
2. **Criptografia de Dados:** ChaCha20-Poly1305 com chave derivada da senha
3. **Assinatura Digital:** Ed25519 para validar integridade
4. **Armazenamento:** Apenas dados criptografados são commitados

### Validação de Integridade
- Todos os arquivos `.enc` são validados pelo GitHub Actions
- Assinaturas digitais verificadas antes do merge
- Usuários só podem modificar seus próprios dados

### Formato dos Dados Criptografados

```json
{
  "version": "1.0",
  "algorithm": "ChaCha20-Poly1305",
  "nonce": "base64_encoded_nonce",
  "ciphertext": "base64_encoded_encrypted_data",
  "signature": "ed25519_signature",
  "public_key": "ed25519_public_key",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## 🛡️ Regras de Segurança

1. **Isolamento de Usuários:** Cada usuário só pode acessar seus próprios dados
2. **Validação de Commits:** GitHub Actions verifica todas as mudanças
3. **Assinaturas Obrigatórias:** Todos os dados devem ser assinados digitalmente
4. **Criptografia End-to-End:** Dados nunca são armazenados em texto plano

## 📝 Como Adicionar Dados

1. **Gerar Chaves:** Use o sistema de cadastro do Pixter
2. **Criptografar Dados:** Use as funções de criptografia do frontend
3. **Assinar Digitalmente:** Assine com sua chave privada Ed25519
4. **Commit Seguro:** Faça commit apenas dos arquivos `.enc`

## ⚠️ Importante

- **NUNCA** commite chaves privadas
- **SEMPRE** valide assinaturas antes do merge
- **APENAS** modifique seus próprios arquivos
- **USE** o sistema de criptografia do Pixter para todos os dados
