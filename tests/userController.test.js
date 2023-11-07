const request = require("supertest");
const app = require("../server"); 
const User = require("../models/userModel");

const generateRandomString = (length = 6) => {
    return Math.random().toString(20).substr(2, length);
}
global.email = generateRandomString() + "admin@admin.com";

describe("POST /api/user/signup", () => {
    it("should signup with tests data", async () => {
        const response = await request(app)
            .post("/api/user/signup")
            .send({
                    first_name: "TestFirst",
                    last_name: "TestLast",
                    role: "leader",
                    email,
                    password: "Temppass12!",
                    city: "CityTest",
                    age: 18,
                    sex: "male",
                });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("token");
    });
});

describe("POST /api/user/signin", () => {
    it("should login with admin user", async () => {
        const response = await request(app)
          .post("/api/user/signin")
          .send({
            email,
            password: "Temppass12!",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("token");
    });
});

afterAll(async () => {
    await User.deleteOne({ email });
});