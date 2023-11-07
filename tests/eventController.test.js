const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/userModel");
const Event = require("../models/eventModel");

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const getToken = async (email) => {
    const createTestUser = await User.signup("TestFirst", "TestLast", "leader", "CityTest", 18, "male", email, "Temppass12!");
    global.user_id = createTestUser._id.toString();
    return createToken(user_id);
}

const generateRandomString = (length = 6) => {
    return Math.random().toString(20).substr(2, length);
}

global.email = generateRandomString() + "admin@admin.com";
global.token = await getToken(email);
global.event_id = null;

describe("POST /api/event/create", () => {
    it("should create new event", async () => {
        const response = await request(app)
            .post("/api/event/create")
            .set("Authorization", "Bearer " + token)
            .send({
                event_name: "TestEvent",
                country: "TestCountry",
                start_date: "2023-10-01T17:00:00.000+00:00",
                end_date: "2023-10-01T19:00:00.000+00:00"
            });
        event_id = response.body._id;

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("event_name", "TestEvent");
        expect(response.body).toHaveProperty("country", "TestCountry");
        expect(response.body).toHaveProperty("user_id", user_id);
    });
});

describe("GET /api/event/event_id", () => {
    it("should get single event", async () => {
        const response = await request(app)
            .get("/api/event/" + event_id)
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "TestEvent");
        expect(response.body).toHaveProperty("country", "TestCountry");
        expect(response.body).toHaveProperty("user_id", user_id);
    });
});

describe("GET /api/event/", () => {
    it("should get all events", async () => {
        const response = await request(app)
            .get("/api/event/")
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("events");
        expect(response.body.events).toHaveLength(1);
    });
});

describe("PATCH /api/event/update/event_id", () => {
    it("should update event", async () => {
        const response = await request(app)
            .patch("/api/event/update/" + event_id)
            .set("Authorization", "Bearer " + token)
            .send({
                event_name: "TestEvent1",
                country: "TestCountry1",
                start_date: "2023-11-01T17:00:00.000+00:00",
                end_date: "2023-11-01T19:00:00.000+00:00",
                description: "testDescription",
                capacity: 200,
                ticket_start_sale_date: "2023-11-01T17:00:00.000+00:00",
                ticket_end_sale_date: "2023-11-01T19:00:00.000+00:00",
                ticket_price: 100,
                ticket_currency: "usdollar",
                age_min: 18,
                age_max: 40
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "TestEvent1");
        expect(response.body).toHaveProperty("country", "TestCountry1");
        expect(response.body).toHaveProperty("description", "testDescription");
        expect(response.body).toHaveProperty("capacity", 200);
        expect(response.body).toHaveProperty("ticket_price", 100);
        expect(response.body).toHaveProperty("ticket_currency", "usdollar");
        expect(response.body).toHaveProperty("age_min", 18);
        expect(response.body).toHaveProperty("age_max", 40);
        expect(response.body).toHaveProperty("user_id", user_id);
    });
});

describe("PATCH /api/event/event_id/add-user", () => {
    it("should add new user to event", async () => {
        const newEmail = new Date().getTime() + email;
        const response = await request(app)
            .patch("/api/event/" + event_id + "/add-user")
            .set("Authorization", "Bearer " + token)
            .send({
                first_name: "TestFirst",
                last_name: "TestLast",
                role: "participant",
                email: newEmail,
                password: "Temppass12!",
                city: "CityTest",
                age: 18,
                sex: "male",
            });

        const getUser = await User.findOne({ email: newEmail });
        global.newEventUser = getUser._id.toString();
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "TestEvent1");
        expect(response.body).toHaveProperty("country", "TestCountry1");
        expect(response.body).toHaveProperty("description", "testDescription");
        expect(response.body).toHaveProperty("capacity", 200);
        expect(response.body).toHaveProperty("ticket_price", 100);
        expect(response.body).toHaveProperty("ticket_currency", "usdollar");
        expect(response.body).toHaveProperty("age_min", 18);
        expect(response.body).toHaveProperty("age_max", 40);
        expect(response.body).toHaveProperty("user_id", user_id);
        expect(response.body).toHaveProperty("participant_ids");
        expect(response.body.participant_ids).toHaveLength(1);
        expect(response.body.participant_ids).toEqual([newEventUser]);
    });
});

describe("GET /api/event/event_id/list", () => {
    it("should get list of all users of event", async () => {
        const response = await request(app)
            .get("/api/event/" + event_id + "/list")
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("usersList");
        expect(response.body.usersList).toHaveLength(1);
    });
});

describe("DELETE /api/event/event_id/delete-user/user_id", () => {
    it("should delete user from event", async () => {
        const response = await request(app)
            .delete("/api/event/" + event_id + "/delete-user/" + newEventUser)
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "TestEvent1");
        expect(response.body).toHaveProperty("country", "TestCountry1");
        expect(response.body).toHaveProperty("description", "testDescription");
        expect(response.body).toHaveProperty("capacity", 200);
        expect(response.body).toHaveProperty("ticket_price", 100);
        expect(response.body).toHaveProperty("ticket_currency", "usdollar");
        expect(response.body).toHaveProperty("age_min", 18);
        expect(response.body).toHaveProperty("age_max", 40);
        expect(response.body).toHaveProperty("user_id", user_id);
        expect(response.body).toHaveProperty("participant_ids");
        expect(response.body.participant_ids).toHaveLength(0);
    });
});

describe("PATCH /api/event/subscribe/event_id", () => {
    it("should subscribe to the event", async () => {
        const response = await request(app)
            .patch("/api/event/subscribe/" + event_id)
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("first_name", "TestFirst");
        expect(response.body).toHaveProperty("last_name", "TestLast");
        expect(response.body).toHaveProperty("role", "leader");
        expect(response.body).toHaveProperty("city", "CityTest");
        expect(response.body).toHaveProperty("age", 18);
        expect(response.body).toHaveProperty("sex", "male");
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("event_ids", [event_id]);
    });
});

describe("PATCH /api/event/subscribe/event_id", () => {
    it("should unsubscribe to the event", async () => {
        const response = await request(app)
            .patch("/api/event/subscribe/" + event_id)
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("first_name", "TestFirst");
        expect(response.body).toHaveProperty("last_name", "TestLast");
        expect(response.body).toHaveProperty("role", "leader");
        expect(response.body).toHaveProperty("city", "CityTest");
        expect(response.body).toHaveProperty("age", 18);
        expect(response.body).toHaveProperty("sex", "male");
        expect(response.body).toHaveProperty("email", email);
        expect(response.body).toHaveProperty("event_ids", []);
    });
});

describe("DELETE /api/event/delete/event_id", () => {
    it("should delete event", async () => {
        const response = await request(app)
            .delete("/api/event/delete/" + event_id)
            .set("Authorization", "Bearer " + token);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "TestEvent1");
        expect(response.body).toHaveProperty("country", "TestCountry1");
        expect(response.body).toHaveProperty("description", "testDescription");
        expect(response.body).toHaveProperty("capacity", 200);
        expect(response.body).toHaveProperty("ticket_price", 100);
        expect(response.body).toHaveProperty("ticket_currency", "usdollar");
        expect(response.body).toHaveProperty("age_min", 18);
        expect(response.body).toHaveProperty("age_max", 40);
        expect(response.body).toHaveProperty("user_id", user_id);
    });
});

describe("POST /api/event/import", () => {
    it("should import external event", async () => {
        const response = await request(app)
            .post("/api/event/import")
            .set("Authorization", "Bearer " + token)
            .send({
                url: "https://book.chanceyouth.org/api/camps/4",
                country: "Belarus"
            });

        global.import_event = response.body._id;

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("event_name", "Winter Retreat 2023");
        expect(response.body).toHaveProperty("country", "Belarus");
        expect(response.body).toHaveProperty("user_id", user_id);
    });
});

afterAll(async () => {
    await User.deleteOne({ email });
    await User.deleteOne({ _id: newEventUser });
    await Event.deleteOne({ _id: import_event });
});