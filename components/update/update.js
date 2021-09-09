const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

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

  const getPersonagemById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

  router.use(function (req, res, next) {
    next();
  });

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res.status(400).send({
        error: "Requisição inválida, obrigatório os campos nome e imagemUrl",
      });
      return;
    }

    const quantidadePersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });

    if (quantidadePersonagens !== 1) {
      res.status(404).send("Personagem não encontrado");
      return;
    }

    const result = await personagens.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: objeto,
      }
    );

    if (result.acknowledged == "undefined") {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar o personagem" });
      return;
    }

    res.send(await getPersonagemById(id));
  });
})();

module.exports = router;