// declare dependencies
const express = require("express");
const { getProfile, editProfile, changePassword } = require("../controllers/profileController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// middleware
router.use(requireAuth);

// profile info
router.get("/", getProfile);
// edit profile
router.patch("/edit", editProfile);
// change password
router.patch("/change-password", changePassword);

module.exports = router;