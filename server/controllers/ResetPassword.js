const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}
		const token = crypto.randomBytes(20).toString("hex");

		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

		const url = `http://localhost:3000/update-password/${token}`;

		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
		const userDetails = await User.findOne({ token: token });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};









// const User = require('../models/User')
// const mailSender = require('../utils/mailSender')
// const bcrypt = require('bcrypt')


// //reset password token
// exports.resetPasswordToken = async (req,res)=>{
// try{
//     //get email from req body

//     const {email} = req.body;
    
//     //check if email is available or not
//     const user = await User.findOne({email});

//     if(!user){
//         return res.status(401).json({
//             success:false,
//             message:"Your email is not registered",
//         })
//     }


//     //generate token
//     const token = crypto.randomUUID();

    
//     //update user by adding token and exipration time
//     const updatedDetails = await User.findOneAndUpdate(
//                                 {email:email},
//                                 {token:token,
//                                  resetPasswordExpires: Date.now() + 5*1000*60,   
//                                 },
//                                 {new:true});

//     //create url
//     const url = `http://localhost:3000/update-password/${token}`

//     //send mail containing url
//     await mailSender(email, `Password Reset link", "Password Reset Link: ${url}`)

//     //return response
//     return res.status(200).json({
//         success:true,
//         message:"Email sent successfully",
//     })
// }
// catch(error){
//     console.log(error);
//     return res.status(500).json({
//         success:false,
//         message:"Something went wrong while resetting password",
//     })
// }

// }

// //reset password
// exports.resetPassword = async(req,res)=>{
// try{
//     //fetch data
//     const {password, confirmPassword, token} = req.body;

//     //validation of data
//     if(password !== confirmPassword){
//         return res.json({
//             success:false,
//             message:"Passwords not matching",
//         })
//     }


//     //get user details from DB using token
//     const userDetails = await User.findOne({token:token})

//     //if no entry - invalid token
//     if(!userDetails){
//         return res.json({
//             success:false,
//             message:"Token Invalid",
//         })
//     }

//     //time check for token
//     if(userDetails.resetPasswordExpires < Date.now()){
//         return res.json({
//             success:false,
//             message:"Token expired, please regenerate your token",
//         })
//     }

//     //hash password
//     const hashedPassword = await bcrypt.hash(password,10);

//     //update password
//     await User.findOneAndUpdate({token:token},
//                                 {password:hashedPassword},
//                                 {new:true})

//     //return response
//     return res.status(200).json({
//         success:true,
//         message:"Password reset successful"
//     })
// }
// catch(error){
//     console.log(error)
//     return res.json({
//         success:false,
//         message:"Something went wrong while resetting password",
//     })
// }
// }