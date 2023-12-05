export const HandleSignin = async (req, res, database, bcrypt) => {
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
          .join("workout", "users.email", "workout.email")
          .select("workout.routine")
          .where("users.email", "=", email);
  
        res.json(user[0]);
      } else {
        res.status(400).json("Wrong credentials");
      }
    } catch (error) {
      res.status(400).json("Wrong credentials");
    }
  };