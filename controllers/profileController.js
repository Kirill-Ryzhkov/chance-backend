// declare dependencies
const User = require("../models/userModel");
const validator = require("validator");

async function findUserById(userId) {
    return await User.findById(userId);
}

function cleanUserObject(user) {
    const cleanedUser = user.toObject();
    delete cleanedUser.password;
    delete cleanedUser.__v;
    return cleanedUser;
}

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authorized user profile.
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful receipt of authorized user profile.
 *         content:
 *           application/json:
 *             example:
 *               _id: "your-unique-user-id"
 *               first_name: "TestUser"
 *               last_name: "TestUser"
 *               role: "leader"
 *               city: "USA"
 *               age: 20
 *               sex: "male"
 *               email: "test@test.com"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const getProfile = async (req, res) => {
    const user_id = req.user;

    try {
        const user = await User.findById(user_id).select(["-password", "-__v"]);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @swagger
 * /api/profile/edit:
 *   patch:
 *     summary: Edit authorized user information.
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: first_name
 *         description: User's first name.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: last_name
 *         description: User's last name.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: role
 *         description: User's role ("leader", "participant").
 *         in: formData
 *         required: false
 *         type: string
 *       - name: city
 *         description: User's city.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: age
 *         description: User's age.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: sex
 *         description: User's sex ("male", "female").
 *         in: formData
 *         required: false
 *         type: string
 *       - name: email
 *         description: User's email.
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Successful receipt of authorized user profile.
 *         content:
 *           application/json:
 *             example:
 *               _id: "your-unique-user-id"
 *               first_name: "TestUser"
 *               last_name: "TestUser"
 *               role: "leader"
 *               city: "New York"
 *               age: 20
 *               sex: "male"
 *               email: "test@test.com"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const editProfile = async (req, res) => {
    const user_id = req.user;
    try {
        await User.findOneAndUpdate(user_id, req.body);
        const data = await User.findById(user_id).select(["-password", "-__v"]);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

/**
 * @swagger
 * /api/profile/change-password:
 *   patch:
 *     summary: Change authorized user password.
 *     tags:
 *       - Profile
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: old_password
 *         description: Old user's password.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: new_password
 *         description: New user's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Your password has been successfully changed!"
 *       400:
 *         description: Incorrect old password / Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "Incorrect old password"
 *       404:
 *          description: User not found.
 *          content:
 *            application/json:
 *              example:
 *                error: "User not found"
 */
const changePassword = async (req, res) => {
    const user_id = req.user;
    const { old_password, new_password } = req.body;

    try {
        const user = await findUserById(user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const match = await Bun.password.verify(old_password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Incorrect old password" });
        }

        const hash = await Bun.password.hash(new_password, {
            algorithm: "bcrypt",
            cost: 10
        });
        user.password = hash;
        await user.save();

        res.status(200).json({ message: "Your password has been successfully changed!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


module.exports = {
    getProfile,
    editProfile,
    changePassword
};