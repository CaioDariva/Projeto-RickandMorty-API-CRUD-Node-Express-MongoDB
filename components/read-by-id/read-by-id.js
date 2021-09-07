const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const router = express.Router();

(async () => {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbChar = process.env.DB_CHAR;
    const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@caiomongo.${dbChar}.mongodb.net/${dbHost}?retryWrites=true&w=majority`;
    const options = {
        useUnifiedTopology: true,
      };
    const client = await mongodb.MongoClient.connect(connectionString, options);
    const db = client.db("db_projetorick");
    const personagens = db.collection("personagens");

    const getPersonagemById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

    //Middleware - especifica que é esse o import do router no index que queremos utilizar
    router.use(function timelog(req, res, next) {
        next();
        console.log("Time: ", Date.now());
    });
    
    //[GET] GetPersonagensById
    router.get("/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id)
        const personagem = await getPersonagemById(id);
        if (!personagem) {
        res
            .status(404)
            .send({ error: "O personagem especificado não foi encontrado" });
        return;
        }
    res.send(personagem);
    });
})();
  
module.exports = router;