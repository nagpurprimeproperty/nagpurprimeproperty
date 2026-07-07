import { getRedis } from '../src/config/redis.js';

async function clearCache() {
  try {
    const redis = getRedis();
    console.log('Clearing all property cache keys...');
    
    // Clear all property:* keys
    let cursor = '0';
    let clearedCount = 0;
    
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'property:*', 'COUNT', 100);
      cursor = nextCursor;
      
      if (keys.length > 0) {
        await redis.del(...keys);
        clearedCount += keys.length;
        console.log(`Cleared ${keys.length} keys (cursor: ${cursor})`);
      }
    } while (cursor !== '0');
    
    console.log(`✓ Total cache keys cleared: ${clearedCount}`);
    console.log('Ready for fresh geo search testing!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing cache:', err.message);
    process.exit(1);
  }
}

clearCache();
