const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { answers } = req.body;

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
          description: "needed equipment for workout routine",
          items: { type: "string" },
        },
        routine: {
          type: "object",
          description: "workout routine for a week",
          properties: {
            mon: {
              type: "array",
              description: "Monday",
              items: { type: "string" },
            },
            tue: {
              type: "array",
              description: "Tuesday",
              items: { type: "string" },
            },
            wed: {
              type: "array",
              description: "Wednesday",
              items: { type: "string" },
            },
            thu: {
              type: "array",
              description: "Thursday",
              items: { type: "string" },
            },
            fri: {
              type: "array",
              description: "Friday",
              items: { type: "string" },
            },
            sat: {
              type: "array",
              description: "Saturday",
              items: { type: "string" },
            },
            sun: {
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

    const response = await openai.chat.completions
      .create({
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
      })
      .then((res) => JSON.parse(res.choices[0].message.function_call.arguments));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});

app.post("/test", async (req, res) => {
  try {
    const { answers } = req.body;
    const response = answers;

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server",
    });
  }
});
