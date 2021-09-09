// Configurações Express, MongoDB e DotEnv
const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require("dotenv").config();
require("express-async-errors");
const cors = require("cors");

// requires de end points
const home = require("./components/home/home");
const readById = require("./components/read-by-id/read-by-id");
const readAll = require("./components/read-all/read-all");
const create = require("./components/create/create");
const update = require("./components/update/update");
const del = require("./components/delete/delete");

const app = express();
app.use(express.json());

// process.env.port é usado para vim a porta da nuvem, por exemplo, para subir no heroku
const port = process.env.PORT || 3000;

// CORS NOVO
app.use(cors()); 
app.options("*", cors());

// Rota Home
app.use("/home", home);

// Rota Get All
app.use("/personagens/read-all", readAll);

// Rota Get By Id pegando do components
app.use("/personagens/read-by-id", readById);

// Rota Criar personagem
app.use("/personagens/create", create);

// Rota para dar update no personagem
app.use("/personagens/update", update);

// Rota para deletar o personagem
app.use("/personagens/delete", del);

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
