import { NextFunction, Request, Response } from "express";
import send from "../utils/response/index.js";
import jwt from 'jsonwebtoken';
import { parse } from "cookie";

interface customRequest extends Request {
    id?: string;
}

export const authMiddleware = async (req: customRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token; // stores JWT token recived from frontend
        if (token) {
            // verify token 
            jwt.verify(token, String(process.env.JWT_SECRET), (err: any, decoded: any) => {
                if (err) {
                    send.unauthorized(res, "Invailed Token");
                } else {
                    req.id = decoded.id; // sends user id to controller 
                    next();
                }
            });
        } else {
            send.badRequest(res, "No Token Provided");
        }
    } catch (error) {
        send.internalError(res);
    }
};


export const authMiddlewareForSocketIo = async (socket: any, next: any) => {
    try {
        const token = socket.handshake.headers.cookie; // parse and store JWT token
        if (token) {
            const parsedToken = String(parse(token).token)
            // verify token 
            jwt.verify(parsedToken, String(process.env.JWT_SECRET), (err: any, decoded: any) => {
                if (err) {
                    next(new Error("Invailed Token"))
                } else {
                    socket.data.id = decoded.id; // sends user id to controller 
                    next();
                }
            });
        } else {
            next(new Error("No Token Provided"))
        }
    } catch (error) {
        next(new Error("Internal server error"))
    }
};