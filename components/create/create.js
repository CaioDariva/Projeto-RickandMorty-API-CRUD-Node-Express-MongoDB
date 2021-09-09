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

  router.use(function (req, res, next) {
    next();
  });

  router.post("/", async (req, res) => {
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res.status(400).send({
        error: "Requisição inválida, obrigatório os campos nome e imagemUrl",
      });
      return;
    }

    const result = await personagens.insertOne(objeto);

    if (result.acknowledged == false) {
      res.status(500).send({ error: "Ocorreu um erro" });
      return;
    }

    res.status(201).send(objeto);
  });
})();

module.exports = router;