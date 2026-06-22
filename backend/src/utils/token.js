const jwt = require("jsonwebtoken");

function generateEmailToken(email) {
  return jwt.sign(
    { purpose: "email-verification", email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

module.exports = {
  generateEmailToken,
};
