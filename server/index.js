const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin:"http://localhost:3000",
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);


//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})










// const express = require('express');
// const app = express();

// const userRoute = require('./routes/User');
// const profileRoutes = require('./routes/Profile');
// const paymentRoutes = require('./routes/Payment');
// const courseRoutes = require('./routes/Course');

// const database = require('./config/database');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const {cloudinaryConnect} = require('./config/cloudinary');
// const fileUpload = require('express-fileupload');
// const dotenv = require('dotenv');

// const PORT = process.env.PORT || 4000;

// //database connect
// database.connect();

// //middlewares
// app.use(express.json());

// app.use(cookieParser);
// app.use(
//     cors({
//         origin:"http://localhost:3000",
//         credentials:true,
//     })
// )
// app.use(
//     fileUpload({
//         useTempFiles:true,
//         tempFileDir:'/tmp',
//     })
// )

// //cloudinary Connect
// cloudinaryConnect();

// //routes
// app.use("/api/vi/auth",userRoute);
// app.use("/api/vi/profile",profileRoutes);
// app.use("/api/vi/payment",paymentRoutes);
// app.use("/api/vi/course",courseRoutes);

// //def route

// app.get('/', (req,res)=>{
//     return res.json({
//         success:true,
//         messsage:"Your server is up and running",
//     })
// })

// app.listen(PORT, ()=>{
//     console.log(`App is running at ${PORT}`)
// })

