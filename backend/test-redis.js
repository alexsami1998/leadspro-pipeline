import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: '72.60.144.80',
    port: 6379
  },
  password: 'DEv019107'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Conectado ao Redis');
});

async function testRedis() {
  try {
    await redisClient.connect();
    
    // Teste básico
    await redisClient.set('test', 'Hello Redis!');
    const value = await redisClient.get('test');
    console.log('✅ Teste básico:', value);
    
    // Teste de dados binários (simulando uma imagem)
    const testImageData = Buffer.from('fake-image-data-12345');
    await redisClient.set('test:image', testImageData);
    const retrievedData = await redisClient.get('test:image');
    console.log('✅ Teste de dados binários:', retrievedData ? 'Sucesso' : 'Falhou');
    
    // Limpar dados de teste
    await redisClient.del('test');
    await redisClient.del('test:image');
    
    console.log('✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await redisClient.quit();
  }
}

testRedis();
