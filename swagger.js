const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Chance Api",
            version: "1.0",
            description: "This is chance api for frontend",
        },
    },
    apis: ["./controllers/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;