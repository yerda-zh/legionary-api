import express from "express";
import OpenAI from "openai";
import cors from "cors";
import bcrypt from "bcrypt-nodejs";// used for hashing passwords
import knex from "knex";
import dotenv from "dotenv";

import { HandleChat } from "./controllers/chat.js";
import { HandleRegister } from "./controllers/register.js";
import { HandleSignin } from "./controllers/signin.js";
import { HandleSave } from "./controllers/save.js";
import { HandleDelete } from "./controllers/delete.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.POSTGRES_PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// configuring knex.js which helps to write manage postgresql
const dbConfig = {
  client: process.env.POSTGRES_CLIENT,
  connection: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  },
};

const database = knex(dbConfig);

app.post("/chat", (req, res) => {HandleChat(req, res, openai)});

app.post("/register", (req, res) => {HandleRegister(req, res, database, bcrypt)});

app.post("/signin", (req, res) => {HandleSignin(req, res, database, bcrypt)});

app.put("/save", (req, res) => {HandleSave(req, res, database)});

app.delete("/delete", (req, res) => {HandleDelete(req, res, database)});

