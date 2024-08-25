const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require("path");
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');
const jwt = require('express-jwt');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database is connected successfully!");
    } catch (err) {
        console.log(err);
    }
};

// Middleware setup
dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

// CORS configuration
const corsOptions = {
    origin: 'https://blog-client-azure-six.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // if you need to include cookies in requests
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.use(cookieParser());

// JWT Middleware
app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: ['/api/auth'] }));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, fn) => {
        fn(null, "images");
    },
    filename: (req, file, fn) => {
        fn(null, req.body.img);
        // fn(null, "image1.jpg");
    }
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("Image has been uploaded successfully!");
});

// Example Route to Extract Token Manually
app.get('/api/protected-route', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // Proceed with the token (e.g., verify it manually if needed)
        res.status(200).json({ message: 'Token received', token });
    } catch (err) {
        res.status(401).json({ message: 'Authorization token missing or invalid' });
    }
});

// Start server
app.listen(process.env.PORT, () => {
    connectDB();
    console.log("App is running on port " + process.env.PORT);
});
