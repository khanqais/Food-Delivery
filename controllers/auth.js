const User = require("../model/user");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const axios = require("axios");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        const token = user.createJWT();
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/");
    } catch (error) {
        res.status(400).render("signup", { user: req.user, currentPage: "signup", errorMessage: error.message });
    }
};

const login = async (req, res) => {
    try {

        
        const { email, password, "g-recaptcha-response": captcha } = req.body;

        if (!captcha) {
            return res.status(400).render("login", { 
                user: req.user || null, 
                currentPage: "login", 
                errorMessage: "Please complete the CAPTCHA" 
            });
        }

        
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        
        
        const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        
        
        const response = await axios.post(verifyUrl, null, {
            params: {
                secret: secretKey,
                response: captcha
            }
        });

        if (!response.data.success) {
            console.log("CAPTCHA verification failed:", response.data);
            return res.status(401).render("login", { 
                user: req.user || null, 
                currentPage: "login", 
                errorMessage: "CAPTCHA verification failed" 
            });
        }

        
        if (!email || !password) {
            return res.status(400).render("login", { user: req.user || null, currentPage: "login", errorMessage: "Please provide email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).render("login", { user: req.user || null, currentPage: "login", errorMessage: "Invalid credentials" });
        }

        const isPassword = await user.comparePassword(password);
        if (!isPassword) {
            return res.status(401).render("login", { user: req.user || null, currentPage: "login", errorMessage: "Invalid password" });
        }

        
        const token = user.createJWT();
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/");
    } catch (error) {
        res.status(500).render("login", { user: req.user || null, currentPage: "login", errorMessage: "Something went wrong" });
    }
};

const forgetpassword = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email) {
            return res.status(400).send({message: "please provide the email"});
        }
        const checkuser = await User.findOne({email});
        if(!checkuser) {
            return res.status(400).send({message: "User Not Found"});
        }
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: "1h"});
        const tranporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_PASSWORD,
            },
        });
        const receiver = {
            from: "qais34913@gmail.com",
            to: email,
            subject: "Password Reset Request",
            text: `Click on this link to generate your password ${process.env.CLIENT_URL}/reset-password/${token}`
        };
        await tranporter.sendMail(receiver);
        return res.status(200).render("forgot-password", { user: req.user || null, successMessage: "Password reset link sent successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).render("forgot-password", { user: req.user || null, errorMessage: "Something went wrong" });
    }
};

const resetpassword = async (req, res) => {
    try {
        const { token } = req.params; 
        const { password } = req.body;

        if (!password) {
            return res.status(400).render("reset-password", { user: req.user || null, errorMessage: "Error in password", token });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        user.password = password;
        await user.save();

        return res.status(200).render("reset-password", { user: req.user || null, successMessage: "Password has been reset successfully!", token });
    } catch (error) {
        console.log(error);
        return res.status(500).render("reset-password", { user: req.user || null, errorMessage: "Something went wrong. Please try again.", token });
    }
};

module.exports = {
    login,
    register,
    forgetpassword,
    resetpassword
};