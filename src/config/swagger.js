import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Movies Hub API",
      version: "1.0.0",
      description: "API documentation for Movies Hub",
      contact: {
        name: "Khanshan",
        email: "Khanshan@example.com",
      },
    },
    servers: [
      {
        url: "http://192.168.0.28:4500", // Your server URL
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/user-routes.js", "./routes/admin-routes.js"], // Path to API documentation
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(JSON.stringify(swaggerDocs, null, 2));

// Export swagger UI middleware
export const swaggerMiddleware = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocs);