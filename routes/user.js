// declare dependencies
const express = require("express");
const {
    signupUser,
    signinUser
} = require("../controllers/userController");

const router = express.Router();

// sign up
router.post("/signup", signupUser);
// login
router.post("/signin", signinUser);

module.exports = router;