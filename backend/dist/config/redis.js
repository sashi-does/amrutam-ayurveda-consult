"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getRedisClient;
const redis_1 = require("@upstash/redis");
function getRedisClient() {
    return new redis_1.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}
//# sourceMappingURL=redis.js.map