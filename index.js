// Configurações Express e MongoDB
const express = require("express");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

(async () => {
    // Configurações express e port
    const app = express();
    app.use(express.json());
    const port = 3000;
    
    // Fazer conexão direta com o banco
    const connectionString = `mongodb://localhost:27017/db_projetorick`
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