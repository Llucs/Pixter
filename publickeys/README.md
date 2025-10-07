# 🔑 Chaves Públicas do Pixter

Este diretório contém as chaves públicas Ed25519 de todos os usuários registrados no Pixter. Essas chaves são usadas para verificar assinaturas digitais e validar a autenticidade dos dados.

## 📂 Estrutura dos Arquivos

### Formato dos Arquivos
```
publickeys/
├── usuario1.pub              # Chave pública do usuario1
├── usuario2.pub              # Chave pública do usuario2
├── ana_silva.pub             # Chave pública da ana_silva
└── ...
```

**Nome do arquivo:** `{username}.pub`

### Conteúdo dos Arquivos

Cada arquivo `.pub` contém a chave pública Ed25519 em formato base64:

```
# Exemplo de conteúdo do arquivo usuario1.pub
MCowBQYDK2VwAyEAGb9ECWmEzf6FQbrBZ9w7lP2s5WOkLWdc1QviXmzs5B0=
```

## 🔐 Sistema de Chaves Ed25519

### Geração de Chaves
1. **No Cadastro:** Usuário gera par de chaves Ed25519 no navegador
2. **Chave Privada:** Criptografada com senha e armazenada localmente
3. **Chave Pública:** Enviada para o repositório via Pull Request
4. **Validação:** GitHub Actions valida formato antes do merge

### Características das Chaves Ed25519
- **Tamanho:** 32 bytes (256 bits)
- **Formato:** Base64 encoded
- **Algoritmo:** Curve25519 com SHA-512
- **Segurança:** Resistente a ataques quânticos conhecidos

## 🛡️ Validação e Segurança

### Processo de Registro
1. **Geração Local:** Chaves geradas no navegador do usuário
2. **Pull Request:** Chave pública enviada via PR
3. **Validação Automática:** GitHub Actions verifica formato
4. **Merge Seguro:** Apenas chaves válidas são aceitas

### Validações Implementadas
- ✅ Formato base64 válido
- ✅ Tamanho correto (32 bytes)
- ✅ Nome de usuário único
- ✅ Sem caracteres especiais no nome
- ✅ Chave não duplicada

### Workflow de Validação
```yaml
# Exemplo de validação no GitHub Actions
- name: Validate public key
  run: |
    # Verificar formato base64
    if ! echo "$KEY_CONTENT" | base64 -d > /dev/null 2>&1; then
      echo "❌ Invalid base64 format"
      exit 1
    fi
    
    # Verificar tamanho
    KEY_SIZE=$(echo "$KEY_CONTENT" | base64 -d | wc -c)
    if [ "$KEY_SIZE" -ne 32 ]; then
      echo "❌ Invalid key size: $KEY_SIZE bytes"
      exit 1
    fi
```

## 🔍 Uso das Chaves Públicas

### Verificação de Assinaturas
As chaves públicas são usadas para verificar que os dados foram realmente criados pelo usuário:

```javascript
// Exemplo de verificação de assinatura
const verifySignature = async (data, signature, username) => {
  const publicKey = await fetchPublicKey(username);
  return nacl.sign.detached.verify(
    data,
    signature,
    publicKey
  );
};
```

### Validação de Integridade
Antes de exibir qualquer conteúdo, o sistema verifica:
1. **Assinatura válida:** Dados não foram alterados
2. **Chave correta:** Dados vieram do usuário correto
3. **Timestamp válido:** Dados não são muito antigos

## 📝 Processo de Adição de Chave

### Para Novos Usuários
1. **Cadastro no Frontend:** Usuário cria conta no Pixter
2. **Geração de Chaves:** Sistema gera par Ed25519 automaticamente
3. **Download da Chave:** Usuário baixa arquivo `.pub`
4. **Pull Request:** Usuário faz PR adicionando sua chave
5. **Validação:** GitHub Actions valida e aprova automaticamente
6. **Ativação:** Conta fica ativa após merge da chave

### Template de Pull Request
```markdown
## 🔑 Adição de Nova Chave Pública

**Usuário:** {username}
**Tipo:** Nova chave pública Ed25519

### Checklist
- [ ] Chave gerada no frontend oficial do Pixter
- [ ] Formato base64 válido
- [ ] Nome de usuário único
- [ ] Arquivo nomeado corretamente ({username}.pub)

### Validação Automática
Este PR será validado automaticamente pelo GitHub Actions.
```

## 🔄 Rotação de Chaves

### Quando Rotacionar
- 🔴 **Imediatamente:** Se chave privada foi comprometida
- 🟡 **Anualmente:** Como boa prática de segurança
- 🟢 **Opcional:** Para mudança de dispositivo principal

### Processo de Rotação
1. **Gerar Nova Chave:** No frontend do Pixter
2. **Backup de Dados:** Descriptografar e re-criptografar com nova chave
3. **Atualizar Chave Pública:** PR com nova chave
4. **Migrar Dados:** Atualizar todos os arquivos `.enc`
5. **Revogar Chave Antiga:** Mover para `publickeys/revoked/`

## 🚨 Revogação de Chaves

### Motivos para Revogação
- Chave privada comprometida
- Usuário perdeu acesso à chave
- Violação de termos de uso
- Solicitação do próprio usuário

### Processo de Revogação
```bash
# Mover chave para diretório de revogadas
mv publickeys/usuario.pub publickeys/revoked/usuario_revoked_2025-01-01.pub

# Adicionar à lista de revogação
echo "usuario.pub revoked 2025-01-01 reason: compromised" >> publickeys/revoked.txt
```

## 📊 Estatísticas e Monitoramento

### Métricas Coletadas
- Número total de chaves ativas
- Chaves adicionadas por mês
- Chaves revogadas e motivos
- Tentativas de validação falhadas

### Dashboard de Monitoramento
```bash
# Estatísticas rápidas
echo "Chaves ativas: $(ls publickeys/*.pub | wc -l)"
echo "Chaves revogadas: $(ls publickeys/revoked/*.pub | wc -l)"
echo "Última adição: $(ls -t publickeys/*.pub | head -1)"
```

## ⚠️ Considerações de Segurança

### Proteções Implementadas
- **Validação Automática:** Todas as chaves são validadas
- **Isolamento:** Cada usuário só pode adicionar sua própria chave
- **Auditoria:** Todas as mudanças são logadas
- **Backup:** Chaves são replicadas automaticamente

### Limitações
- **Sem Recuperação:** Perda da chave privada é irreversível
- **Dependência do GitHub:** Sistema depende da disponibilidade do GitHub
- **Tamanho do Repositório:** Muitas chaves podem aumentar o tamanho

### Boas Práticas
- 🔐 **Nunca** compartilhe sua chave privada
- 💾 **Sempre** faça backup da chave privada
- 🔄 **Rotacione** chaves periodicamente
- 🚨 **Revogue** imediatamente se comprometida
