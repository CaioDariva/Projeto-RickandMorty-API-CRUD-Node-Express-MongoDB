// Configurações Express, MongoDB e DotEnv
const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
require ("dotenv").config();

(async () => {
    // Configurações Express, port e DotEnv
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;
    const app = express();
    app.use(express.json());
    // process.env.port é usado para vim a porta da nuvem, por exemplo, para subir no heroku
    const port = process.env.port || 3000;
    
    // Fazer conexão direta com o banco
    const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    const options = {
        useUnifiedTopology: true,
    };
    const client = await mongodb.MongoClient.connect(connectionString, options);
    const db = client.db("db_projetorick");
    const personagens = db.collection("personagens");

    // Criar funções "padrões", que vão ser usadas em mais de uma rota, etc
    const getPersonagensValidos = () => personagens.find({}).toArray();
    const getPersonagemById = async (id) => personagens.findOne({_id: ObjectId(id)});

    // Rota Home
    app.get('/', (req, res) => {
        res.send({"info": "Olá Mundo!"});
    });

    // Rota Get All
    app.get("/personagens", async (req,res) => {
        res.send(await getPersonagensValidos())
    });



    // Fazer a porta ser "ouvida"
    app.listen(port, () => {
        console.log(`App rodando em http://localhost:${port}`);
    });
})();