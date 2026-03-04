import rateLimit from "express-rate-limit";

export default class Limiters {
    static defaultLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        statusCode: 429,
        message: "Demasiadas peticiones. Por favor, inténtalo más tarde.",
        standardHeaders: true,
        legacyHeaders: false
    });
}