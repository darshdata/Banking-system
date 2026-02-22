const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

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

         res.cookies("token", token);

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
    }
    catch{
        console.error((err) => console.log(err));
    }
};

module.exports = {
    userRegisterController
}
