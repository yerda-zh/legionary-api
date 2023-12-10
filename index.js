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

const corsOptions = {
  origin: 'https://legionary.vercel.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const port = process.env.DATABASE_PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// configuring knex.js which helps to write manage postgresql
const dbConfig = {
  client: process.env.DATABASE_CLIENT,
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_DB,
  },
};

const database = knex(dbConfig);

app.post("/chat", (req, res) => {HandleChat(req, res, openai)});

app.post("/register", (req, res) => {HandleRegister(req, res, database, bcrypt)});

app.post("/signin", (req, res) => {HandleSignin(req, res, database, bcrypt)});

app.put("/save", (req, res) => {HandleSave(req, res, database)});

app.delete("/delete", (req, res) => {HandleDelete(req, res, database)});

