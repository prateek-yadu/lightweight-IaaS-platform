import { rateLimit } from "express-rate-limit";

/**
 * Limits user to send **50 requests per minute**.  
 * Use for **non-sensitive API routes**.  
 * **eg**. plans, billings etc.
 */
export const limitModerate = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 50, // Limit each IP to 50 requests per `window` (here, per minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ipv6Subnet: 60, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});

/**
 * Limits user to send **25 requests per minute**.  
 * Use for **sensitive API routes**.  
 * **eg**. auth, vps etc.
 */
export const limitStrict = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 25, // Limit each IP to 25 requests per `window` (here, per minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    ipv6Subnet: 48, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});
