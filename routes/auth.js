const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/auth");

router.get("/signup", (req, res) => {
    return res.render("signup", { user: req.user, currentPage: "signup", errorMessage: null });
});

router.get("/login", (req, res) => {
    return res.render("login", { user: req.user, currentPage: "login", errorMessage: null });
});

router.get("/order", (req, res) => {
    return res.render("order", { user: req.user, currentPage: "order" });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.post("/signup", register);
router.post("/login", login);

module.exports = router;
