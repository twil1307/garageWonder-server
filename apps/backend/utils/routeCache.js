const redisClient = require('../config/redis');
const memcacheClient = require('../config/memcache');

// redis cache
module.exports.redisApiCache =
  (duration = 3600, pattern) =>
      async (req, res, next) => {
          if (req.method !== 'GET') {
              console.error('Cannot cache non-GET methods');
              return next();
          }

          const key = req.originalUrl;

          if(pattern && !pattern.test(key)) {
              return next();
          }

          const cachedResponse = await redisClient.get(key);

          if (cachedResponse) {
              console.log(`Cache hit for ${key}`);
              
              return res.json(JSON.parse(cachedResponse));
          } else {
              console.log(`Cache miss for ${key}`);
              // assign res.end for another properties (recently defined not built in)
              res.originalSend = res.json;

              // assign for res.send a callback that will set the cache after send the response back to the client
              // at this time, send no longer has the same effect as it used to
              res.json = (body) => {
                  console.log(body);
                  set.set(key, JSON.stringify(body), 'EX', duration);
                  res.originalSend(body);
              };
              next();
          }
      };

module.exports.clearCacheWithPattern = async (pattern) => {
    const data = await redisClient.keys(pattern);
    if(!data || data.length === 0) return;
    await redisClient.del(data);
    return;
};

// memcache
module.exports.memCacheApiCache =
  (duration = 12) =>
      async (req, res, next) => {
          if (req.method !== 'GET') {
              console.error('Cannot cache non-GET methods');
              return next();
          }

          const key = req.originalUrl;
          const cachedResponse = await memcacheClient.get(key);

          if (cachedResponse) {
              console.log(`Cache hit for ${key}`);
              console.log(cachedResponse);
              // res.send(cachedResponse);
              return res.json(JSON.parse(cachedResponse));
          } else {
              console.log(`Cache miss for ${key}`);
              // assign res.end for another properties (recently defined not built in)
              res.originalSend = res.json;

              // assign for res.send a callback that will set the cache after send the response back to the client
              // at this time, send no longer has the same effect as it used to
              res.json = (body) => {
                  console.log(body);
                  res.originalSend(body);
                  memcacheClient.set(key, JSON.stringify(body), { expires: duration });
              };
              next();
          }
      };
