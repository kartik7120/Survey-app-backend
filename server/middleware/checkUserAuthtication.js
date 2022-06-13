const JWT = require("jsonwebtoken");
const checkUserAuthentication = (req, res, next) => {
    const token = req.header("o-auth-token");
    if (!token) {
        return res.status(404).json("Token not found");
    }
    try {
        JWT.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        return res.status(404).json("Token is invalid");
    }
}
module.exports = checkUserAuthentication;