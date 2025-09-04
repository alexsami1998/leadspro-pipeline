import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

class RedisService {
  constructor() {
    this.client = createClient({
      socket: {
        host: '72.60.144.80',
        port: 6379
      },
      password: 'DEv019107'
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Conectado ao Redis para mídias');
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  // Salvar mídia no Redis
  async saveMedia(fileBuffer, filename, mimeType) {
    try {
      await this.connect();
      
      const mediaId = uuidv4();
      const key = `media:${mediaId}`;
      const metadataKey = `media:${mediaId}:metadata`;
      
      // Salvar o arquivo binário como base64
      const base64Data = fileBuffer.toString('base64');
      await this.client.set(key, base64Data);
      
      // Salvar metadados
      const metadata = {
        id: mediaId,
        filename: filename,
        mimeType: mimeType,
        size: fileBuffer.length,
        uploadedAt: new Date().toISOString()
      };
      
      await this.client.set(metadataKey, JSON.stringify(metadata));
      
      // Definir TTL de 30 dias (em segundos)
      await this.client.expire(key, 30 * 24 * 60 * 60);
      await this.client.expire(metadataKey, 30 * 24 * 60 * 60);
      
      return {
        mediaId,
        metadata
      };
    } catch (error) {
      console.error('Erro ao salvar mídia no Redis:', error);
      throw error;
    }
  }

  // Recuperar mídia do Redis
  async getMedia(mediaId) {
    try {
      await this.connect();
      
      const key = `media:${mediaId}`;
      const metadataKey = `media:${mediaId}:metadata`;
      
      // Verificar se a mídia existe
      const exists = await this.client.exists(key);
      if (!exists) {
        return null;
      }
      
      // Recuperar metadados
      const metadataStr = await this.client.get(metadataKey);
      if (!metadataStr) {
        return null;
      }
      
      const metadata = JSON.parse(metadataStr);
      
      // Recuperar arquivo binário do Redis
      const rawData = await this.client.get(key);
      
      // Se os dados são binários (não base64), usar diretamente
      let fileBuffer;
      if (typeof rawData === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(rawData)) {
        // É base64 válido
        fileBuffer = Buffer.from(rawData, 'base64');
      } else {
        // É dados binários diretos - usar latin1 para preservar todos os bytes
        fileBuffer = Buffer.from(rawData, 'latin1');
      }
      
      return {
        buffer: fileBuffer,
        metadata
      };
    } catch (error) {
      console.error('Erro ao recuperar mídia do Redis:', error);
      throw error;
    }
  }

  // Deletar mídia do Redis
  async deleteMedia(mediaId) {
    try {
      await this.connect();
      
      const key = `media:${mediaId}`;
      const metadataKey = `media:${mediaId}:metadata`;
      
      await this.client.del(key);
      await this.client.del(metadataKey);
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar mídia do Redis:', error);
      throw error;
    }
  }

  // Verificar se mídia existe
  async mediaExists(mediaId) {
    try {
      await this.connect();
      
      const key = `media:${mediaId}`;
      const exists = await this.client.exists(key);
      
      return exists === 1;
    } catch (error) {
      console.error('Erro ao verificar existência da mídia:', error);
      return false;
    }
  }

  // Listar todas as mídias (para debug)
  async listAllMedia() {
    try {
      await this.connect();
      
      const keys = await this.client.keys('media:*:metadata');
      const mediaList = [];
      
      for (const key of keys) {
        const metadataStr = await this.client.get(key);
        if (metadataStr) {
          const metadata = JSON.parse(metadataStr);
          mediaList.push(metadata);
        }
      }
      
      return mediaList;
    } catch (error) {
      console.error('Erro ao listar mídias:', error);
      return [];
    }
  }
}

// Instância singleton
const redisService = new RedisService();

export default redisService;
