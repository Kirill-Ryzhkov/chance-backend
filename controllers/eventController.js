// declare dependencies
const Event = require("../models/eventModel");
const User = require("../models/userModel");
const axios = require("axios");

/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Get all events.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful receipt of all events.
 *         content:
 *           application/json:
 *             example:
 *               events:
 *                    - participant_ids: []
 *                      _id: "your-unique-event-id"
 *                      event_name: "TestEvent"
 *                      country: "USA"
 *                      start_date: "2023-10-01T17:00:00.000Z"
 *                      end_date: "2023-10-01T19:00:00.000Z"
 *                      user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const getEvents = async (req, res) => {
    const user_id = req.user._id;

    try {
        const events = await Event.where({ user_id }).select(["-__v"]);
        res.status(200).json({events});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/{id}:
 *   get:
 *     summary: Get single event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful receipt of single events.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const getEvent = async (req, res) => {
    const user_id = req.user._id;
    const event_id = req.params.id;

    try {
        const event = await Event.findOne({user_id, _id: event_id}).select(["-__v"]);
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/subscribe/{id}:
 *   patch:
 *     summary: Toggle subscription to the event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful subscribe/unsubscribe to the event.
 *         content:
 *           application/json:
 *             example:
 *               _id: "6542bec72b8026458b9b0a6a"
 *               first_name: "Test"
 *               last_name: "Test"
 *               role: "leader"
 *               city: "testcity"
 *               age: 18
 *               sex: "male"
 *               email: "test@test.com"
 *               event_ids: [
 *                 6543b060f067c4258e505681
 *              ]
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const toggleSubscribeEvent = async (req, res) => {
    const user_id = req.user._id;
    const event_id = req.params.id;

    try {
        const [event, user] = await Promise.all([
            Event.findOne({ _id: event_id }),
            User.findOne({ _id: user_id }).select("-password")
        ]);

        if (!event && !user) {
            res.status(400).json({error: "Event id or user id is wrong"});
        }

        const indexOfEvent = user.event_ids.indexOf(event_id);
        const indexOfUser = event.participant_ids.indexOf(user_id);

        if (indexOfUser !== -1 && indexOfEvent !== -1) {
            event.participant_ids.splice(indexOfUser, 1);
            user.event_ids.splice(indexOfEvent, 1);
        } else {
            event.participant_ids.push(user_id);
            user.event_ids.push(event_id);
        }

        await Promise.all([
            user.save(),
            event.save()
        ]);

        res.status(200).json(user);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/import:
 *   post:
 *     summary: Import external event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: url
 *         description: Link to external event.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: country
 *         description: Country of event.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful import of event.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *                 logo: "data:image/svg+xml;base64..."
 *                 external_id: "external_event_id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const importEvent = async (req, res) => {
    const user_id = req.user._id;
    const { country, url } = req.body;

    try {
        axios.get(url)
            .then(async response => {
                const { name: event_name, startDate: start_date, endDate: end_date } = response.data;
                const fields = {
                    logo: response.data.landingLogoImage,
                    external_id: response.data.id
                };
                const result = await Event.createEvent(event_name, country, start_date, end_date, user_id, fields);
                res.status(200).json(result);
            })
            .catch(error => {
                res.status(400).json({error: error.message});
            })
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/create:
 *   post:
 *     summary: Create new event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: event_name
 *         description: Event name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: country
 *         description: Country of event.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: start_date
 *         description: Start event date.
 *         in: formData
 *         required: true
 *         type: date
 *       - name: end_date
 *         description: Start event date.
 *         in: formData
 *         required: true
 *         type: date
 *       - name: description
 *         description: Event description.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: capacity
 *         description: Event capacity.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: ticket_start_sale_date
 *         description: Sale tickets start date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: ticket_end_sale_date
 *         description: Sale tickets end date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: ticket_price
 *         description: Ticket price.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: ticket_currency
 *         description: Currency of tickets ("usdollar", "euro", "belruble").
 *         in: formData
 *         required: false
 *         type: string
 *       - name: age_min
 *         description: Min age.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: age_max
 *         description: Max age.
 *         in: formData
 *         required: false
 *         type: number
 *     responses:
 *       201:
 *         description: Event successfully has been created.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const createEvent = async (req, res) => {
    const { event_name, country, start_date, end_date } = req.body;
    const user_id = req.user._id;

    try {
        const event = await Event.createEvent(event_name, country, start_date, end_date, user_id);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

/**
 * @swagger
 * /api/event/update/{id}:
 *   patch:
 *     summary: Update event by id.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *       - name: event_name
 *         description: Event name.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: country
 *         description: Country of event.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: start_date
 *         description: Start event date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: end_date
 *         description: Start event date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: description
 *         description: Event description.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: capacity
 *         description: Event capacity.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: ticket_start_sale_date
 *         description: Sale tickets start date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: ticket_end_sale_date
 *         description: Sale tickets end date.
 *         in: formData
 *         required: false
 *         type: date
 *       - name: ticket_price
 *         description: Ticket price.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: ticket_currency
 *         description: Currency of tickets ("usdollar", "euro", "belruble").
 *         in: formData
 *         required: false
 *         type: string
 *       - name: age_min
 *         description: Min age.
 *         in: formData
 *         required: false
 *         type: number
 *       - name: age_max
 *         description: Max age.
 *         in: formData
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: Event successfully has been updated.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 */
const updateEvent = async (req, res) => {
    const user_id = req.user._id;

    try {
        const event = await Event.updateEvent(req.params.id, user_id, req.body);
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

/**
 * @swagger
 * /api/event/delete/{id}:
 *   delete:
 *     summary: Delete event by id.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Event successfully removed.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 *       404:
 *         description: Event has already removed.
 *         content:
 *           application/json:
 *             example:
 *               error: "Your event has already removed or event_id is wrong"
 */
const deleteEvent = async (req, res) => {
    const user_id = req.user._id;

    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, user_id });
        if (!event) {
            res.status(404).json({ message: "Your event has already removed or event_id is wrong "});
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/{id}/add-user:
 *   patch:
 *     summary: Add new user to event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *       - name: first_name
 *         description: User's first name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: last_name
 *         description: User's last name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: role
 *         description: User's role ("leader", "participant").
 *         in: formData
 *         required: true
 *         type: string
 *       - name: city
 *         description: User's city.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: age
 *         description: User's age.
 *         in: formData
 *         required: true
 *         type: number
 *       - name: sex
 *         description: User's sex ("male", "female").
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: User's email.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: New user added to event.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids:
 *                   - "participant-unique-id"
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 *       404:
 *         description: Event has not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Event has not found"
 */
const addNewUser = async (req, res) => {
    const user_id = req.user._id;
    const { first_name, last_name, role, city, age, sex, email, password } = req.body;

    try {
        const event = await Event.findOne({ _id: req.params.id, user_id });
        if (event) {
            const newUser = await User.signup(first_name, last_name, role, city, age, sex, email, password);

            newUser.event_ids.push(req.params.id);
            event.participant_ids.push(newUser._id);

            await event.save();
            await newUser.save();
            res.status(200).json(event);
        }
        res.status(404).json({ message: "Event has not found" });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

/**
 * @swagger
 * /api/event/{id}/list:
 *   get:
 *     summary: Get all users of event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful receipt of all events.
 *         content:
 *           application/json:
 *             example:
 *               usersList:
 *                    - _id: "your-unique-user-id"
 *                      first_name: "TestUser"
 *                      last_name: "TestUser"
 *                      role: "leader"
 *                      city: "USA"
 *                      age: 20
 *                      sex: "male"
 *                      email: "test@test.com"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 *       404:
 *         description: Event has not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Event has not found"
 */
const getAllUsersOfEvent = async (req, res) => {
    const user_id = req.user._id;

    try {
        const event = await Event.findOne({ _id: req.params.id, user_id });

        if (event) {
            const usersList = await User.find({ _id: { $in: event.participant_ids } });
            res.status(200).json({ usersList });
        }
        res.status(404).json({ message: "Event has not found" });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

/**
 * @swagger
 * /api/event/{id}/delete-user/{user_id}:
 *   delete:
 *     summary: Delete user from event.
 *     tags:
 *       - Events
 *     parameters:
 *       - name: Authorization
 *         description: Authorization bearer token (Bearer your-token).
 *         in: header
 *         required: true
 *         type: string
 *       - name: id
 *         description: ID of event.
 *         in: path
 *         required: true
 *         type: string
 *       - name: user_id
 *         description: ID of user.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Event successfully removed.
 *         content:
 *           application/json:
 *             example:
 *                 participant_ids: []
 *                 _id: "your-unique-event-id"
 *                 event_name: "TestEvent"
 *                 country: "USA"
 *                 start_date: "2023-10-01T17:00:00.000Z"
 *                 end_date: "2023-10-01T19:00:00.000Z"
 *                 user_id: "your-unique-user-id"
 *       400:
 *         description: Something went wrong.
 *         content:
 *           application/json:
 *             example:
 *               error: "You have an error"
 *       404:
 *         description: Event has not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Event has not found"
 */
const deleteUserFromEvent = async (req, res) => {
    const leader_id = req.user._id;
    const delete_user_id = req.params.user_id;

    try {
        const event = await Event.findOne({ _id: req.params.id, user_id: leader_id });

        if (event) {
            const indexOfUser = event.participant_ids.indexOf(delete_user_id);
            if (indexOfUser !== -1) {
                event.participant_ids.splice(indexOfUser, 1);
                await event.save();
            }
            res.status(200).json(event);
        }
        res.status(404).json({ message: "Event has not found" });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    getEvents,
    getEvent,
    toggleSubscribeEvent,
    importEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addNewUser,
    getAllUsersOfEvent,
    deleteUserFromEvent
};