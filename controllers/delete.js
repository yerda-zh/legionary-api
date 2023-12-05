export const HandleDelete = (req, res, database) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json("Unable to delete the user");
    }
  
    database.transaction((trx) => {
      trx("workout").where({ email }).del()
        .then(() => {
          return trx("login").where({ email }).del();
        })
        .then(() => {
          return trx("users").where({ email }).del();
        })
        .then(trx.commit)
        .catch((error) => {
          trx.rollback();
          res.status(400).json("Unable to delete");
        });
    })
    .then(() => {
      res.json("Successfully deleted account");
    })
    .catch((err) => {
      res.status(400).json("Unable to delete");
    });
  };