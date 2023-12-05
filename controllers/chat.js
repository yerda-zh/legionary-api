export const HandleChat = async (req, res, openai) => {
    try {
      const { answers } = req.body;
      if (answers.length === 0) {
        return res.status(400).json("No data was provided.");
      }
  
      // Create prompt text with user input
      const prompt = `Create personalized workout routine of exercises with sets and reps for a ${answers[0]}, within age category of ${answers[1]}, goal - ${answers[2]}, body type - ${answers[3]}, level of body fat - ${answers[5]}, level of fitness - ${answers[6]}, place for workouts - ${answers[7]}, willing to spend - ${answers[8]}.`;
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
                description: "Routine for Monday",
                items: { type: "string" },
              },
              tuesday: {
                type: "array",
                description: "Routine for Tuesday",
                items: { type: "string" },
              },
              wednesday: {
                type: "array",
                description: "Routine for Wednesday",
                items: { type: "string" },
              },
              thursday: {
                type: "array",
                description: "Routine for Thursday",
                items: { type: "string" },
              },
              friday: {
                type: "array",
                description: "Routine for Friday",
                items: { type: "string" },
              },
              saturday: {
                type: "array",
                description: "Routine for Saturday",
                items: { type: "string" },
              },
              sunday: {
                type: "array",
                description: "Routine for Sunday",
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
        model: "gpt-3.5-turbo-1106",
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
  
      const responseData = await JSON.parse(response.choices[0].message.function_call.arguments);
  
      return res.status(200).json({ data: responseData });
    } catch (error) {
      return res.status(400).json({
        error: error.response ? error.response.data : "There was an issue on the server",
      });
    }
  };