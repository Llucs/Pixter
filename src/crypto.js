import nacl from 'tweetnacl'
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util'

/**
 * Módulo de Criptografia do Pixter
 * Implementa Ed25519 para assinaturas digitais e ChaCha20-Poly1305 para criptografia
 */

// Utilitários para conversão
export const utils = {
  stringToUint8Array: encodeUTF8,
  uint8ArrayToString: decodeUTF8,
  uint8ArrayToBase64: encodeBase64,
  base64ToUint8Array: decodeBase64,
  
  // Gera um salt aleatório
  generateSalt: () => nacl.randomBytes(32),
  
  // Deriva uma chave a partir de uma senha usando PBKDF2 simplificado
  deriveKey: async (password, salt, iterations = 100000) => {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    // Importa a senha como chave PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    // Deriva a chave
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    
    // Exporta como raw bytes
    const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey)
    return new Uint8Array(keyBuffer)
  }
}

/**
 * Classe para gerenciamento de chaves Ed25519
 */
export class KeyPair {
  constructor(publicKey, secretKey) {
    this.publicKey = publicKey
    this.secretKey = secretKey
  }
  
  // Gera um novo par de chaves
  static generate() {
    const keyPair = nacl.sign.keyPair()
    return new KeyPair(keyPair.publicKey, keyPair.secretKey)
  }
  
  // Cria um par de chaves a partir de uma seed
  static fromSeed(seed) {
    const keyPair = nacl.sign.keyPair.fromSeed(seed)
    return new KeyPair(keyPair.publicKey, keyPair.secretKey)
  }
  
  // Exporta a chave pública em base64
  getPublicKeyBase64() {
    return utils.uint8ArrayToBase64(this.publicKey)
  }
  
  // Exporta a chave secreta em base64
  getSecretKeyBase64() {
    return utils.uint8ArrayToBase64(this.secretKey)
  }
  
  // Assina uma mensagem
  sign(message) {
    const messageBytes = typeof message === 'string' 
      ? utils.stringToUint8Array(message) 
      : message
    return nacl.sign(messageBytes, this.secretKey)
  }
  
  // Verifica uma assinatura
  static verify(signedMessage, publicKey) {
    const publicKeyBytes = typeof publicKey === 'string'
      ? utils.base64ToUint8Array(publicKey)
      : publicKey
    return nacl.sign.open(signedMessage, publicKeyBytes)
  }
}

/**
 * Classe para criptografia simétrica
 */
export class Encryption {
  // Criptografa dados com uma chave
  static encrypt(data, key) {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    const dataBytes = typeof data === 'string' 
      ? utils.stringToUint8Array(data) 
      : data
    
    const encrypted = nacl.secretbox(dataBytes, nonce, key)
    
    // Combina nonce + dados criptografados
    const combined = new Uint8Array(nonce.length + encrypted.length)
    combined.set(nonce)
    combined.set(encrypted, nonce.length)
    
    return utils.uint8ArrayToBase64(combined)
  }
  
  // Descriptografa dados com uma chave
  static decrypt(encryptedData, key) {
    const combined = utils.base64ToUint8Array(encryptedData)
    const nonce = combined.slice(0, nacl.secretbox.nonceLength)
    const encrypted = combined.slice(nacl.secretbox.nonceLength)
    
    const decrypted = nacl.secretbox.open(encrypted, nonce, key)
    if (!decrypted) {
      throw new Error('Falha na descriptografia')
    }
    
    return utils.uint8ArrayToString(decrypted)
  }
}

/**
 * Classe principal para gerenciamento de usuário
 */
export class UserCrypto {
  constructor(username, keyPair, encryptionKey) {
    this.username = username
    this.keyPair = keyPair
    this.encryptionKey = encryptionKey
  }
  
  // Cria um novo usuário com senha
  static async create(username, password) {
    // Gera salt para derivação da chave
    const salt = utils.generateSalt()
    
    // Deriva chave de criptografia da senha
    const encryptionKey = await utils.deriveKey(password, salt)
    
    // Gera par de chaves Ed25519
    const keyPair = KeyPair.generate()
    
    // Criptografa a chave privada com a senha
    const encryptedSecretKey = Encryption.encrypt(keyPair.secretKey, encryptionKey)
    
    // Dados do usuário para armazenar
    const userData = {
      username,
      salt: utils.uint8ArrayToBase64(salt),
      publicKey: keyPair.getPublicKeyBase64(),
      encryptedSecretKey,
      created: new Date().toISOString()
    }
    
    return {
      userCrypto: new UserCrypto(username, keyPair, encryptionKey),
      userData
    }
  }
  
  // Carrega um usuário existente com senha
  static async load(userData, password) {
    const salt = utils.base64ToUint8Array(userData.salt)
    const encryptionKey = await utils.deriveKey(password, salt)
    
    try {
      // Descriptografa a chave privada
      const secretKeyBytes = Encryption.decrypt(userData.encryptedSecretKey, encryptionKey)
      const secretKey = utils.base64ToUint8Array(secretKeyBytes)
      const publicKey = utils.base64ToUint8Array(userData.publicKey)
      
      const keyPair = new KeyPair(publicKey, secretKey)
      
      return new UserCrypto(userData.username, keyPair, encryptionKey)
    } catch (error) {
      throw new Error('Senha incorreta')
    }
  }
  
  // Criptografa dados do usuário
  encryptData(data) {
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data)
    return Encryption.encrypt(jsonData, this.encryptionKey)
  }
  
  // Descriptografa dados do usuário
  decryptData(encryptedData) {
    const jsonData = Encryption.decrypt(encryptedData, this.encryptionKey)
    try {
      return JSON.parse(jsonData)
    } catch {
      return jsonData
    }
  }
  
  // Assina dados
  signData(data) {
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data)
    const signed = this.keyPair.sign(jsonData)
    return utils.uint8ArrayToBase64(signed)
  }
  
  // Verifica assinatura
  static verifySignature(signedData, publicKey) {
    try {
      const signedBytes = utils.base64ToUint8Array(signedData)
      const verified = KeyPair.verify(signedBytes, publicKey)
      if (!verified) return null
      
      const jsonData = utils.uint8ArrayToString(verified)
      try {
        return JSON.parse(jsonData)
      } catch {
        return jsonData
      }
    } catch {
      return null
    }
  }
  
  // Cria um changeset assinado para o GitHub
  createChangeset(changes) {
    const changeset = {
      username: this.username,
      timestamp: new Date().toISOString(),
      changes,
      publicKey: this.keyPair.getPublicKeyBase64()
    }
    
    const signedChangeset = this.signData(changeset)
    
    return {
      changeset,
      signature: signedChangeset
    }
  }
}

/**
 * Gerenciador de armazenamento local
 */
export class LocalStorage {
  static PREFIX = 'pixter_'
  
  // Salva dados do usuário
  static saveUserData(username, userData) {
    const key = `${this.PREFIX}user_${username}`
    localStorage.setItem(key, JSON.stringify(userData))
  }
  
  // Carrega dados do usuário
  static loadUserData(username) {
    const key = `${this.PREFIX}user_${username}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  
  // Lista usuários salvos
  static listUsers() {
    const users = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(`${this.PREFIX}user_`)) {
        const username = key.replace(`${this.PREFIX}user_`, '')
        users.push(username)
      }
    }
    return users
  }
  
  // Remove dados do usuário
  static removeUser(username) {
    const key = `${this.PREFIX}user_${username}`
    localStorage.removeItem(key)
  }
  
  // Salva dados criptografados
  static saveEncryptedData(key, data) {
    localStorage.setItem(`${this.PREFIX}${key}`, data)
  }
  
  // Carrega dados criptografados
  static loadEncryptedData(key) {
    return localStorage.getItem(`${this.PREFIX}${key}`)
  }
}

// Exporta as classes principais
export default {
  UserCrypto,
  KeyPair,
  Encryption,
  LocalStorage,
  utils
}
