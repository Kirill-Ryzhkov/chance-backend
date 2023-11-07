// declare dependencies
const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
    createEvent,
    getEvents,
    getEvent,
    toggleSubscribeEvent,
    importEvent,
    updateEvent,
    deleteEvent,
    addNewUser,
    getAllUsersOfEvent,
    deleteUserFromEvent
} = require("../controllers/eventController");

const router = express.Router();

router.use(requireAuth);

// get events
router.get("/", getEvents);
// get exact event
router.get("/:id", getEvent);
// import event
router.post("/import", importEvent);
// subscribe to the event
router.patch("/subscribe/:id", toggleSubscribeEvent);
// add new user to event
router.patch("/:id/add-user", addNewUser);
// get all users of events
router.get("/:id/list", getAllUsersOfEvent);
// delete user from event
router.delete("/:id/delete-user/:user_id", deleteUserFromEvent);
// create new event
router.post("/create", createEvent);
// update event
router.patch("/update/:id", updateEvent);
// delete event
router.delete("/delete/:id", deleteEvent);

module.exports = router;
