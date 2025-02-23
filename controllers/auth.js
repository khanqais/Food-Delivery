const User=require('../model/user')
const {BadRequestError,UnauthenticatedError}=require('../errors')
const { StatusCodes } =require('http-status-codes')

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        const token = user.createJWT();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.status(400).render('signup', { errorMessage: error.message });
    }
};


const login = async (req, res) => { 
    try {
        const { name, password } = req.body;
        if (!name || !password) {
            return res.status(400).render('login', { errorMessage: 'Please provide name and password' });
        }
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).render('login', { errorMessage: 'Invalid credentials' });
        }
        const isPassword = await user.comparePassword(password);
        if (!isPassword) {
            return res.status(401).render('login', { errorMessage: 'Invalid password' });
        }
        const token = user.createJWT();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.status(500).render('login', { errorMessage: 'Something went wrong' });
    }
};
module.exports={
    login,
    register,
}