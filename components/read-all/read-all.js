const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");

(async () => {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbChar = process.env.DB_CHAR;
    const dbCollection = process.env.DB_COLLECTION;
  
    const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@caiomongo.${dbChar}.mongodb.net/${dbHost}?retryWrites=true&w=majority`;

  const options = {
    useUnifiedTopology: true,
  };

  const client = await mongodb.MongoClient.connect(connectionString, options);

  const db = client.db(dbHost);
  const personagens = db.collection(dbCollection);

  const getPersonagensValidas = () => personagens.find({}).toArray();

  router.use(function (req, res, next) {
    next();
  });

  router.get("/", async (req, res) => {
    res.send(await getPersonagensValidas());
  });
})();

module.exports = router;