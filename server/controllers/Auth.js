const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
	try {
		// Destructure fields from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			otp,
		} = req.body;
		// Check if All Details are there or not
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		// Find the most recent OTP for the email
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		// Hash the password
		const hashedPassword = await bcryptjs.hash(password, 10);

		// Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

		// Create the Additional Profile For User
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});
		const user = await User.create({
			firstName,
			lastName,
			email,
			contactNumber,
			password: hashedPassword,
			accountType: accountType,
			approved: approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};

// Login controller for authenticating users
exports.login = async (req, res) => {
	try {
		// Get email and password from request body
		const { email, password } = req.body;

		// Check if email or password is missing
		if (!email || !password) {
			// Return 400 Bad Request status code with error message
			return res.status(400).json({
				success: false,
				message: `Please Fill up All the Required Fields`,
			});
		}

		// Find user with provided email
		const user = await User.findOne({ email }).populate("additionalDetails");

		// If user not found with provided email
		if (!user) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
		}

		// Generate JWT token and Compare Password
		if (await bcryptjs.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				// expires: new Date(Date.now() + 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
		console.error(error);
		// Return 500 Internal Server Error status code with error message
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;

		// Check if user is already present
		// Find user with provided email
		const checkUserPresent = await User.findOne({ email });
		// to be used in case of signup

		// If user found with provided email
		if (checkUserPresent) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		var otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});
		const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ success: false, error: error.message });
	}
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcryptjs.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		// if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

		// Update password
		const encryptedPassword = await bcryptjs.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};









// const User = require('../models/User')
// const OTP = require('../models/OTP');
// const otpGenerator = require('otp-generator');
// const Profile = require('../models/Profile');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')
// require('dotenv').config();




// //send OTP

// exports.sendOTP = async (req,res) =>{
    
    
//     try{
//     const {email} = req.body;

//     //check if user already present
//     const checkUserPresent = await User.findOne({email});

//     // if user already present return user already present
//     if(checkUserPresent){
//         return res.status(401).json({
//             success: false,
//             message: 'User already present',
//         })
//     }

//     //generate OTP
//     var otp = otpGenerator.generate(6, {
//         upperCaseAlphabets:false,
//         lowerCaseAlphabets:false,
//         specialChars:false,
//     });
//     console.log("OTP generated", otp);

//     //check unique OTP or not
//     let result = await OTP.findOne({otp:otp});

//     while(result){
//         otp = otpGenerator.generate(6, {
//             upperCaseAlphabets:false,
//             lowerCaseAlphabets:false,
//             specialChars:false,
//         });
//         result = await OTP.findOne({otp:otp});
//     }

//     const otpPayload = {email, otp};

//     //create an entry in DB for OTP
//     const otpBody = await OTP.create(otpPayload);
//     console.log(otpBody);

//     res.status(200).json({
//         success:true,
//         message:'OTP sent successfully',
//         otp,
//     })

// }
// catch(error){
//     console.log(error);
//     return res.status(500).json({
//         success:false,
//         message:error.message,
//     })

// }

// }


// //signup

// exports.signUp = async (req, res)=>{
//     try{

//         //data fetch from request's body

//         const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        
//         ///validate 
//         if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ){
//             return res.status(403).json({
//                 success:false,
//                 message:"All fields are required",
//             })
//         }

//         //2 passwords match or not
//         if(password !== confirmPassword){
//             return res.status(400).json({
//                 success:false,
//                 message:"Password and confirm password does not match"
//             })
//         }


//         //check if user already available
//         const existingUser = await User.findOne({email})
//         if(existingUser){
//             return res.status(400).json({
//                 success:false,
//                 message:"User is already registered",
//             })
//         }
        

//         //find most recent otp
//         const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
//         console.log(recentOtp);


//         //validate OTP
//         if(recentOtp.length == 0){
//             return res.status(400).json({
//                 success:false,
//                 message:"OTP not found",
//             })
//         }

//         else if(otp !== recentOtp.otp){
//             return res.status(400).json({
//                 success:false,
//                 message:"OTP not matching",
//             });
//         }


//         //Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);


//         //create entry in DB

//         const profileDetails = await Profile.create({
//             gender:null,
//             dateOfBirth:null,
//             about:null,
//             contactNumber:null,
//         })


//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             contactNumber,
//             password:hashedPassword,
//             accountType,
//             additionalDetails: profileDetails._id,
//             image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//         })


//         //return response
//         return res.status(200).json({
//             success:true,
//             message:"User is registered successfully",
//             user,
//         })

//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:"User cannot be registered."
//         })

//     }
// }


// //Login
// exports.login = async (req, res)=>{
//     try{

//         //get data from req's body
//         const {email, password} = req.body;


//         //validation data
//         if(!email || !password){
//             return res.status(403).json({
//                 success:false,
//                 message:"All fields are required"
//             });
//         }


//         //check user exist or not
//         const user = await User.findOne({email}).populate("additionalDetails");
//         if(!user){
//             return res.status(401).json({
//                 success:false,
//                 message:"User is not registered, please sign up first",
//             })
//         }



//         //generate jwt, after matching password
//         if(await bcrypt.compare(password, user.password)){
//             const payload = {
//                 email: user.email,
//                 id: user._id,
//                 accountType:user.accountType,
//             }
//             const token = jwt.sign(payload, process.env.JWT_SECRET, {
//                 expiresIn:"2h",
//             });

//             user.token = token;
//             user.password = undefined;


//         //create cookie and send response
//         const options = {
//             expires:new Date(Date.now() + 3*24*60*60*1000),
//             httpOnly: true,
//         }
//         res.cookie("token", token, options).status(200).json({
//             success:true,
//             token,
//             user,
//             message:"Logged in successfully"

//         })
//     }
//         else {
//             return res.status(401).json({
//                 success:false,
//                 message:"Password is incorrect",
//             })
//         }



//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:'Login failure, please try again'
//         });
//     }
// }

// //changePassword
// exports.changePassword = async (req,res)=>{
    

//     try{

//     //get data from req's body
//     const {oldPassword, password, confirmPassword} = req.body;

//     //get old Password, new password, confirm password

//     //validation

//     //check if all fields are filled
//     if(!oldPassword || !confirmPassword || !password){
//         return res.status(403).json({
//             success:false,
//             message:"All fields are required"
//         });
//     }

//     //check if password and confirmPassword are same
//     else if(password !== confirmPassword){
//         return res.status(403).json({
//             success:false,
//             message:"Passwords and confirm password does not match"
//         })
//     }

//     //check if old password is matching or not
//     else if(await bcrypt.compare(oldPassword, user.password))

//     //update passeord in DB

//     //send mail - password update

//     //return response

//     }
//     catch{

//     }
    
// }