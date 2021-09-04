// Configurações Express, MongoDB e DotEnv
const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();
require("express-async-errors");
// requires de end points
const home = require("./components/home/home");

(async () => {
  // Configurações Express, port e DotEnv
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbChar = process.env.DB_CHAR;
  const app = express();
  app.use(express.json());
  // process.env.port é usado para vim a porta da nuvem, por exemplo, para subir no heroku
  const port = process.env.port || 3000;

  // Fazer conexão direta com o banco
  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@caiomongo.${dbChar}.mongodb.net/${dbHost}?retryWrites=true&w=majority`;
  const options = {
    useUnifiedTopology: true,
  };
  const client = await mongodb.MongoClient.connect(connectionString, options);
  const db = client.db("db_projetorick");
  const personagens = db.collection("personagens");

  // Criar funções "padrões", que vão ser usadas em mais de uma rota, etc
  const getPersonagensValidos = () => personagens.find({}).toArray();
  const getPersonagemById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

  // CORS
  app.all("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Methods", "*");

    res.header(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
    );

    next();
  });

  // Rota Home
  app.use("/home", home);

  // Rota Get All
  app.get("/personagens", async (req, res) => {
    res.send(await getPersonagensValidos());
  });

  // Rota Get By Id
  app.get("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const personagem = await getPersonagemById(id);
    if (!personagem) {
      res
        .status(404)
        .send({ error: "O personagem especificado não foi encontrado." });
    }
    res.send(personagem);
  });

  // Rota Criar personagem
  app.post("/personagens", async (req, res) => {
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res
        .status(400)
        .send({
          error:
            "Personagem inválido, certifique-se que possui o capo nome e imagemUrl",
        });
      return;
    }
    // validação que retorna true se foi inserido no banco, só entra se der erro no banco
    const result = await personagens.insertOne(objeto);
    if (result.acknowledged == false) {
      res.status(500).send({ error: "Ocorreu um erro" });
      return;
    }

    res.status(201).send(objeto);
  });

  // Rota para dar update no personagem
  app.put("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const objeto = req.body;

    // validação para ver se o que vem do body é válido
    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res
        .status(400)
        .send({
          error:
            "Personagem inválido, certifique-se que possui o capo nome e imagemUrl",
        });
      return;
    }

    // validação que retorna quantos objetos existem com o id passado, no caso se existe um id
    const qntdPersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });
    if (qntdPersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado!" });
      return;
    }

    // fazendo o update
    const result = await personagens.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: objeto,
      }
    );

    // validação para "avisar" quando tem algum problema no banco
    if (result.acknowledged == "undefined") {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao atualizar o personagem." });
      return;
    }
    res.send(await getPersonagemById(id));
  });

  // Rota para deletar o personagem
  app.delete("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    // validação que retorna quantos objetos existem com o id passado, no caso se existe um id
    const qntdPersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });
    if (qntdPersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado!" });
      return;
    }

    const result = await personagens.deleteOne({
      _id: ObjectId(id),
    });

    if (result.deletedCount != 1) {
      res
        .status(500)
        .send({ error: "Ocorre um erro ao remover o personagem!" });
      return;
    }
    // quando não precisa retornar mensagem, o status pode vir denro do parenteses do send
    res.send(204);
  });

  // tratamento de erros

  // middleware para tratar todas as rotas , verifica endpoints
  app.all("*", function (req, res) {
    res.status(404).send({ message: "End point was not found" });
  });

  // middleware tratamento de erro
  app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || "Internal server error",
      },
    });
  });

  // Fazer a porta ser "ouvida"
  app.listen(port, () => {
    console.log(`App rodando em http://localhost:${port}/home`);
  });
})();
