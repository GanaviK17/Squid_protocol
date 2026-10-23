import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts. Please wait 60 seconds before retrying.'
  }
});

export const submissionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 1 per second average
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Rapid submission limit reached. Please wait before submitting again.'
  }
});
