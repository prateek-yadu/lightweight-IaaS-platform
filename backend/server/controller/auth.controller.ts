import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from "express";
import send from "../utils/response/index.js";
import { pool } from '../db/config.js';
import jwt from 'jsonwebtoken';
import { isVailedEmail, isVailedPassword, isVailedUsername } from '../utils/validators/index.js';
import { logger } from '../utils/logger/logger.utils.js';

interface userData {
    name: string;
    email: string;
    profileImage: string;
}

interface customRequest extends Request {
    id?: string;
}

export const Login = async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;

        const isEmailVailed = isVailedEmail(email);

        if (!isEmailVailed) {

            logger.log("auth", { ip: req.ip, message: `[validator]: Failed email check`, type: "error", route: "POST /login" });
            return send.badRequest(res, "Invailed credentials");
        }

        // checks if user exists
        const [exists, fields]: any = await pool.query('SELECT id, name, profile_image, password FROM users WHERE email = ?', [email]);


        if (exists.length != 0) {

            // stores user id
            const userId = exists[0].id;

            // checks password is vailed or not
            const vailed = await bcrypt.compare(password, exists[0].password);

            // if password is vailed send genrate and send token else thow error
            if (vailed) {

                // stores user data to send frontend
                const userInfo: userData = {
                    name: exists[0].name,
                    email: email,
                    profileImage: exists[0].profile_image
                };

                // genrates token
                const token = jwt.sign({ id: exists[0].id }, process.env.JWT_SECRET || "shhh...", {
                    expiresIn: '1d'
                });

                // sets cookie 
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // vailed till 24 hrs
                    secure: process.env.IN_PROD == "true" && true || false
                });

                logger.log("auth", { ip: req.ip, message: "Successfull user login", type: "success", userId: userId, route: "POST /login" });

                // sends response
                send.ok(res, "User Authenticated Successfully", { ...userInfo });
            } else {

                logger.log("auth", { ip: req.ip, message: `Failed login attempt`, type: "error", userId: userId, route: "POST /login" });
                send.unauthorized(res, "Invailed Credentials");
            }
        } else {

            logger.log("auth", { ip: req.ip, message: `Login attempt from invailed email address ${email}`, type: "error", route: "POST /login" });
            send.unauthorized(res, "Invailed Credentials");
        }
    } catch (error) {

        logger.log("auth", { ip: req.ip, message: `Internal Error`, type: "error", route: "POST /login" });
        send.internalError(res);
    }
};

export const Logout = async (req: Request, res: Response) => {

    try {
        const cookie: string | undefined = req.cookies.token;
        if (cookie) {
            res.clearCookie("token");
            send.ok(res, "User logged out successfully");
        } else {
            send.ok(res, "User already logged out");
        }
    } catch (error) {
        logger.log("auth", { ip: req.ip, message: `Internal Error`, type: "error", route: "POST /logout" });
        send.internalError(res);
    }
};

export const Register = async (req: Request, res: Response) => {

    try {
        const { name, email, password } = req.body;

        const isEmailVailed = isVailedEmail(email);
        const isPasswordVailed = isVailedPassword(password);
        const isUsernameVailed = isVailedUsername(name);

        if (!isUsernameVailed) {
            logger.log("auth", { ip: req.ip, message: `[validator]: Failed username check`, type: "error", route: "POST /register" });
            return send.badRequest(res, "Username should not be less than 4 characters");
        }

        if (!isEmailVailed) {
            logger.log("auth", { ip: req.ip, message: `[validator]: Failed email check`, type: "error", route: "POST /register" });
            return send.badRequest(res, "Please enter vailed email");
        }

        if (!isPasswordVailed) {
            logger.log("auth", { ip: req.ip, message: `[validator]: Failed password check`, type: "error", route: "POST /register" });
            return send.badRequest(res, "Password length must be atleast 8 characters");
        }

        const saltRounds: number = typeof (process.env.SALTROUNDS) == "string" && parseInt(process.env.SALTROUNDS) || 10;// adds salt rounds
        // checks if user exists 
        const [exists, fields]: any = await pool.query('SELECT email FROM users WHERE email = ?', [email]);

        if (exists.length != 0) {

            logger.log("auth", { ip: req.ip, message: `User already exists with email ${email}`, type: "error", route: "POST /register" });

            // return duplicate user error
            send.conflict(res, "User Already Exists");
        } else {
            const userId = uuidv4(); // genrates uniqe user ID
            const hash = bcrypt.hashSync(password, saltRounds); // genrates hashed password

            // creates user
            const sql = 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)';
            const values = [userId, name, email, hash];
            const [result, fields] = await pool.execute(sql, values);

            logger.log("auth", { ip: req.ip, message: `User Created successfully with email address ${email}`, type: "success", route: "POST /register" });
            send.created(res, "User Created Successfuly");
        }
    } catch (error) {
        logger.log("auth", { ip: req.ip, message: `Internal server error`, type: "error", route: "POST /register" });
        send.internalError(res);
    }
};

export const Validate = async (req: customRequest, res: Response) => {
    logger.log("auth", { ip: req.ip, message: `Hit success`, type: "success", route: "POST /validate", userId: req.id });
    send.ok(res); // sends ok if middleware validates the token 
};