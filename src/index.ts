import express from "express";
import { config } from "dotenv";

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log(`listening on port ${PORT}!`); });

app.get("/", (req, res) => {
    res.send("Hello World");
});







