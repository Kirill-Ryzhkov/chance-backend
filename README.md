# chance-backend

## Project Overview:

The Event Management project is a comprehensive platform designed for creating, organizing, and managing various events. This project is built to streamline the event management process and provide a user-friendly experience.

## Technology stack

1. Framework: Node.js using Bun for backend development.
2. Database: MongoDB for efficient data storage and retrieval.
3. Testing: Jest for automated testing and quality assurance.
4. Documentation: Swagger for API documentation, making integration easier for developers

## Project deployment

1. [Bun installation](https://bun.sh/docs/installation)

2. Clone project
```shell
git clone https://github.com/Kirill-Ryzhkov/chance-backend.git
cd chance-backend
bun install
```

3. Fill .env file
    - Create .env file in root of directory
    - Fill .env file
    ```env
    PORT=4000
    MONGODB=mongodb+srv://...
    SECRET=...
    ```

4. Start project
```shell
bun start
```

5. Open documentation page in browser
localhost:4000/api-docs

<h3>That's All</h3>
<h3>Enjoy</h3>