export const HandleSave = (req, res, database) => {
    const { email, bmi, routine } = req.body;
  
    if (!email || !bmi || !routine) {
      return res.status(400).json("Unable to save routine");
    }
  
    // saves the workout routine as json into workout table where user id matches
    database
      .transaction((trx) => {
        trx("workout")
          .where({ email })
          .update({routine})
          .then((numUpdatedRows) => {
            if (numUpdatedRows > 0) {
              res.status(200).json("Successfully saved workout");
            } else {
              res.status(400).json("No such user");
            }
  
            return trx("users").where({ email }).update({bmi});
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .catch((error) => res.status(400).json("Unable to save the data"))
};