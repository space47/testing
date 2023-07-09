const User = require('../model/User')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {attachCookiesToResponse, createTokenUser} = require('../utils')

const register = async (req,res) => {
    const {email, name, password}= req.body
    const emailAlreadyExists = await User.findOne({email});
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email already exists')
    }

    // first user register as an admin
    const isFirstUser = await User.countDocuments({})==0;
    const role = isFirstUser? 'admin' : 'user'; 
    const user = await User.create({name, email,password,role})
    const tokenUser = createTokenUser(user);
    // const token = createJWT({payload: tokenUser})
    // // creating cookie
    // const oneDay = 1000 * 60 * 60 * 24

    // res.cookie('token', token, {
    //     httpOnly: true,
    //     expires: new Date(Date.now() + oneDay)
    // })

    attachCookiesToResponse({res,user:tokenUser})

    res.status(StatusCodes.CREATED).json({tokenUser})
}

const login = async (req,res) => {
    const {email, password} = req.body

    if(!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({email})
    if(!user) {
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
    
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res, user: tokenUser})
    res.status(StatusCodes.CREATED).json({user: tokenUser})
}

const logout = async (req,res) => {
    // change the cookie value to logout within 5 seconds of logout
    res.cookie('token','logout',{
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 1000),
    })
    res.status(StatusCodes.OK).json({msg: 'user logged out!'})
}


module.exports = {
    register,
    login,
    logout,
}
