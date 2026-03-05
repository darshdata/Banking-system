const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const blackListModel = require("../models/blackList.model");
/**
 * - user register controller
 * - POST /api/auth/register
 */
const userRegisterController = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        const isExist = await userModel.findOne({ 
            email : email
         });

         if(isExist){
            return res.status(422).json({
                success: false,
                message: "User already exists with this email.",
                status: "failed"
            });
         }

         const user = await userModel.create({
            email,
            name,
            password
         });

         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d"});

         res.cookie("token", token);

         res.status(201).json({
            user:{
                _id: user._id,
                name: user.name,
                email: user.email
            },
            success: true,
            message: "User registered successfully.",
            status: "success"
         });

        await emailService.sendRegistrationEmail(user.email, user.name);
    }
    catch{
        console.error((err) => console.log(err));
    }
};

/**
 * - user login controller
 * - POST /api/auth/login
 */
const userLoginController = async (req,res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if(!user){
        return res.status(401).json({
            success: false,
            message: "Email or password is INVALID.",
            status: "failed"
        });
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        return res.status(401).json({
            success: false,
            message: "Email or password is INVALID.",
            status: "failed"
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d"});

    res.cookie("token", token);

    res.status(200).json({
        user:{
            _id: user._id,
            name: user.name,
            email: user.email
        },
        success: true,
        token
    })
}

/**
 * - user logout controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "No token found.",
            status: "failed"
        });
    }

    res.clearCookie("token");

    await blackListModel.create({ token });

    res.status(200).json({
        success: true,
        message: "User logged out successfully.",
        status: "success"
    });
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}
