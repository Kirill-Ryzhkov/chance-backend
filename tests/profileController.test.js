const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server"); 
const User = require("../models/userModel");

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const getToken = async (email) => {
    const createTestUser = await User.signup("TestFirst", "TestLast", "leader", "CityTest", 18, "male", email, "Temppass12!");
    return createToken(createTestUser._id);
}

const generateRandomString = (length = 6) => {
    return Math.random().toString(20).substr(2, length);
}

global.email = generateRandomString() + "admin@admin.com";
global.token = await getToken(email);

describe("GET /api/profile", () => {
    it("should get profile information", async () => {
        const response = await request(app)
            .get("/api/profile")
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("first_name", "TestFirst");
        expect(response.body).toHaveProperty("last_name", "TestLast");
        expect(response.body).toHaveProperty("role", "leader");
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("city", "CityTest");
        expect(response.body).toHaveProperty("age", 18);
        expect(response.body).toHaveProperty("sex", "male");
    });
});

describe("PATCH /api/profile/edit", () => {
    it("should edit profile information", async () => {
        email = generateRandomString() + "admin@admin.com";
        const response = await request(app)
            .patch("/api/profile/edit")
            .set("Authorization", "Bearer " + token)
            .send({
                first_name: "TestFirst1",
                last_name: "TestLast1",
                city: "CityTest1",
                age: 19,
                sex: "female",
                email
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("first_name", "TestFirst1");
        expect(response.body).toHaveProperty("last_name", "TestLast1");
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("city", "CityTest1");
        expect(response.body).toHaveProperty("age", 19);
        expect(response.body).toHaveProperty("sex", "female");
    });
});

describe("PATCH /api/profile/change-password", () => {
    it("should change password", async () => {
        const response = await request(app)
            .patch("/api/profile/change-password")
            .set("Authorization", "Bearer " + token)
            .send({
                old_password: "Temppass12!",
                new_password: "Temppass1!"
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Your password has been successfully changed!");
    });
});

afterAll(async () => {
    await User.deleteOne({ email });
});