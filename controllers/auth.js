const User = require("../model/user");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

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
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render("login", { user: req.user, currentPage: "login", errorMessage: "Please provide email and password" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).render("login", { user: req.user, currentPage: "login", errorMessage: "Invalid credentials" });
        }
        const isPassword = await user.comparePassword(password);
        if (!isPassword) {
            return res.status(401).render("login", { user: req.user, currentPage: "login", errorMessage: "Invalid password" });
        }
        const token = user.createJWT();
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/");
    } catch (error) {
        res.status(500).render("login", { user: req.user, currentPage: "login", errorMessage: "Something went wrong" });
    }
};

module.exports = {
    login,
    register,
};
