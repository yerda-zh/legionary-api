const express = require("express");
const OpenAI = require("openai");
const cors = require('cors');
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

app.post("/chat", async (req, res) => {
    try {
        const { answers } = req.body;
        const response = await openai.chat.completions
          .create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Create personalized workout routine for a ${answers[0]}, within age category of ${answers[1]}, goal - ${answers[2]}, body type - ${answers[3]}, level of body fat - ${answers[5]}, level of fitness - ${answers[6]}, place for workouts - ${answers[7]}, willing to spend - ${answers[8]}. Use the following format for your response: "Introduction", "Equipment Needed", "Workout Routine for a week", "Advise".  Return as JSON array`,
              },
            ],
          })
          .then((res) => res.choices[0].message.content);
        
        return res.status(200).json({
            success: true,
            data: response
        })
    } catch(error) {
        return res.status(400).json({
            success: false,
            error: error.response ? error.response.data : "There was an issue on the server",
        })
    }
});

app.post("/test", async (req, res) => {
    try {
        const { answers } = req.body;
        const response = answers;
        
        return res.status(200).json({
            success: true,
            data: response
        })
    } catch(error) {
        return res.status(400).json({
            success: false,
            error: error.response ? error.response.data : "There was an issue on the server",
        })
    }
});