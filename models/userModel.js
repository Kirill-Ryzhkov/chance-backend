const mongoose = require("mongoose");
const validator = require("validator");


const Schema = mongoose.Schema;

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["participant", "leader"]
    },
    city: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    sex: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    event_ids: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
    }
});

userSchema.statics.signup = async function (first_name, last_name, role, city, age, sex, email, password) {
    if (!first_name || !last_name || !role || !city || !age || !sex  || !email || !password) {
        throw Error("All fields must be filled");
    }
    if (!validator.isEmail(email)) {
        throw Error("Email is not valid");
    }
    if (!validator.isStrongPassword(password)) {
        throw Error("Password is not strong");
    }
    if (role != "participant" && role != "leader") {
        throw Error("Role is not correct");
    }
    if (sex != "male" && sex != "female") {
        throw Error("Sex is not correct");
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use");
    }

    const hash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10
    });

    return await this.create({
        first_name,
        last_name,
        role,
        city,
        age,
        sex,
        email, 
        password: hash
    });
}

userSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw Error("All fields must be filled");
    }
    if (!validator.isEmail(email)) {
        throw Error("Email is not valid");
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw Error("Incorrect email");
    }

    const match = await Bun.password.verify(password, user.password);

    if (!match) {
        throw Error("Incorrect password");
    }
    
    return user;
}

module.exports = mongoose.model("User", userSchema);