export const HandleRegister = async (req, res, database, bcrypt) => {
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
                    email: user[0].email,
                  })
                  .then(res.json(user[0]));
              });
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .catch((err) => res.status(400).json("Unable to register"));
  };