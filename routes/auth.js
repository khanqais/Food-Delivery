const express = require("express");
const router = express.Router();
const { login, register,forgetpassword,resetpassword } = require("../controllers/auth");

router.get("/signup", (req, res) => {
    return res.render("signup", { user: req.user, currentPage: "signup", errorMessage: null });
});

router.get("/login", (req, res) => {
    return res.render("login", { user: req.user, currentPage: "login", errorMessage: null });
});

router.get("/order", (req, res) => {
    return res.render("order", { user: req.user, currentPage: "order" });
});
router.get("/forgot-password", (req, res) => {
    return res.render("forgot-password", { user: req.user, errorMessage: null });
});
router.get("/reset-password/:token", (req, res) => {
    return res.render("reset-password", { user: req.user, token: req.params.token, errorMessage: null });
});



router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.post("/signup", register);
router.post("/login", login);
router.post("/forgot-password",forgetpassword)
router.post("/reset-password/:token",resetpassword)

module.exports = router;
