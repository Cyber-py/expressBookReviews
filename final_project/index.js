const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, "your-secret-key"); // Use the same secret as in login
      req.user = decoded; // Store decoded token in req.user
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
    }
});
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

app.post('/test', (req, res) => {
    console.log('Test route hit');
    res.send('OK');
});