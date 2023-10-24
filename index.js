import express from "express";
import OpenAI from "openai";
import cors from "cors";
import bcrypt from "bcrypt-nodejs";// used for hashing passwords
import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// configuring knex.js which helps to write manage postgresql
const dbConfig = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'yerda.Sql',
    database: 'legionary_database',
  },
};

const database = knex(dbConfig);

app.post("/chat", async (req, res) => {
  try {
    const { answers } = req.body;
    if (answers.length === 0) {
      return res.status(400).json("No data was provided.");
    }

    // Create prompt text with user input
    const prompt = `Create personalized workout routine with sets and reps for a ${answers[0]}, within age category of ${answers[1]}, goal - ${answers[2]}, body type - ${answers[3]}, level of body fat - ${answers[5]}, level of fitness - ${answers[6]}, place for workouts - ${answers[7]}, willing to spend - ${answers[8]}.`;
    //Define the JSON Schema by creating a schema object
    const schema = {
      type: "object",
      properties: {
        introduction: {
          type: "string",
          description: "Introductory text for workout routine",
        },
        equipment: {
          type: "array",
          description: "Needed equipment for workout routine",
          items: { type: "string" },
        },
        routine: {
          type: "object",
          description: "Workout routine for a week",
          properties: {
            monday: {
              type: "array",
              description: "Monday",
              items: { type: "string" },
            },
            tuesday: {
              type: "array",
              description: "Tuesday",
              items: { type: "string" },
            },
            wednesday: {
              type: "array",
              description: "Wednesday",
              items: { type: "string" },
            },
            thursday: {
              type: "array",
              description: "Thursday",
              items: { type: "string" },
            },
            friday: {
              type: "array",
              description: "Friday",
              items: { type: "string" },
            },
            saturday: {
              type: "array",
              description: "Saturday",
              items: { type: "string" },
            },
            sunday: {
              type: "array",
              description: "Sunday",
              items: { type: "string" },
            },
          },
        },
        advice: {
          type: "string",
          description: "Further advice for workout routine",
        },
      },
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "system",
          content: "You are a workout routine creating trainer",
        },
        { role: "user", content: prompt },
      ],
      functions: [{ name: "workout_routine", parameters: schema }],
      function_call: { name: "workout_routine" },
    });

    const responseData = JSON.parse(response.choices[0].message.function_call.arguments);

    return res.status(200).json({ data: responseData });
  } catch (error) {
    return res.status(400).json({
      error: error.response ? error.response.data : "There was an issue on the server",
    });
  }
});

app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  try{
    const user = await database.select("*").from("users").where({ id });

    if (user.length) {
      res.json(user[0]);
    } else {
      res.status(400).json("Not Found");
    }
  } catch (error) {
    res.status(400).json("Error getting user");
  }
});

app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  //checks whether front end provided data or not
  if (!email || !password || !name) {
    return res.status(400).json("Incorrect form submission");
  }

  // to convert password into hash so that we can store them in database
  const hash = bcrypt.hashSync(password);
  
  // transaction allows to make multiple database operations
  // firstly we store email and password to login then store email, name, joined to users, then store user id into workout table
  database
    .transaction((trx) => {
      trx.insert({hash, email})
        .into("login")
        .returning("email")
        .then((loginEmail) => {
          return trx("users")
            .returning("*")
            .insert({
              email: loginEmail[0].email,
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              trx("workout")
                .insert({
                  user_id: user[0].id,
                })
                .then(res.json(user[0]));
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((err) => res.status(400).json("Unable to register"));
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Incorrect form submission");
  }

  try {
    const data = await database.select("email", "hash").from("login").where("email", "=", email);
    const isValid = bcrypt.compareSync(password, data[0].hash);

    if (isValid) {
      const user = await database
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.bmi",
          "users.joined",
          "workout.routine"
        )
        .from("users")
        .join("workout", "users.id", "workout.user_id")
        .select("workout.routine")
        .where("email", "=", email);

      res.json(user[0]);
    } else {
      res.status(400).json("Wrong credentials");
    }
  } catch (error) {
    res.status(400).json("Wrong credentials");
  }
});

app.put("/save", (req, res) => {
  const { id, bmi, routine } = req.body;

  if (!id || !bmi || !routine) {
    return res.status(400).json("Unable to save routine");
  }

  // saves the workout routine as json into workout table where user id matches
  database
    .transaction((trx) => {
      trx("workout")
        .where({ user_id: id })
        .update({routine})
        .then((numUpdatedRows) => {
          if (numUpdatedRows > 0) {
            res.status(200).json("Success");
          } else {
            res.status(400).json("No such user");
          }

          return trx("users").where({ id: id }).update({bmi});
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((error) => res.status(400).json("Unable to save the data"));
});

app.delete("/delete", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json("Unable to delete the user");
  }

  database.transaction((trx) => {
    trx("workout").where({ user_id: id }).del()
      .then(() => {
        return trx("login").where({ id }).del();
      })
      .then(() => {
        return trx("users").where({ id }).del();
      })
      .then(trx.commit)
      .catch((error) => {
        trx.rollback();
        res.status(400).json("Unable to delete");
      });
  })
  .then(() => {
    res.json("Success");
  })
  .catch((err) => {
    res.status(400).json("Unable to delete");
  });
});

