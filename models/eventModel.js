const mongoose = require("mongoose");
const validator = require("validator");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    event_name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    logo: {
        type: String
    },
    external_id: {
        type: Number
    },
    description: {
        type: String
    },
    capacity: {
        type: Number
    },
    ticket_start_sale_date: {
        type: Date
    },
    ticket_end_sale_date: {
        type: Date
    },
    ticket_price: {
        type: Number
    },
    ticket_currency: {
        type: String,
        enum: ["usdollar", "euro", "belruble"]
    },
    age_min: {
        type: Number
    },
    age_max: {
        type: Number
    },
    participant_ids: {
        type:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
});

function validateFields(event_name, country, start_date, end_date, user_id) {
    if (!event_name || !country || !start_date || !end_date || !user_id) {
        throw Error("All fields must be filled");
    }

    start_date = new Date(start_date);
    end_date = new Date(end_date);

    if (!validator.isDate(start_date) && !validator.isDate(end_date)) {
        throw Error("Date should be in format 2023-10-01T21:00:00.000+00:00");
    }
    if (start_date >= end_date) {
        throw Error("End Date should be after Start Date");
    }

    return {
        start_date,
        end_date
    };
}

eventSchema.statics.createEvent = async function (event_name, country, start_date, end_date, user_id, fields = []) {
    
    const validateData = validateFields(event_name, country, start_date, end_date, user_id);

    if(fields.ticket_currency && !["usdollar", "euro", "belruble"].includes(fields.ticket_currency)){
        throw Error("Wrong currency");
    }

    let data = {
        event_name,
        country,
        start_date: validateData.start_date,
        end_date: validateData.end_date,
        user_id,
    };

    if (fields) {
        data = {
            ...data,
            ...fields
        }
    }

    return this.create(data);
}

eventSchema.statics.updateEvent = async function (event_id, user_id, fields) {
    const filter = {_id: event_id, user_id};
    if(fields.ticket_currency && !["usdollar", "euro", "belruble"].includes(fields.ticket_currency)){
        throw Error("Wrong currency");
    }
    await this.findOneAndUpdate(filter, fields);
    return await this.findOne(filter);
}

module.exports = mongoose.model("Event", eventSchema);