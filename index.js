const express = require("express");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log(`Server listening on port ${port}`));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

app.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content": prompt}]
        }).then(res => res.choices[0].message.content);
        
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