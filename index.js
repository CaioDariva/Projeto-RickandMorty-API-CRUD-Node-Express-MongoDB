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

    // Rota Get By Id
    app.get("/personagens/:id", async (req, res) => {
        const id = req.params.id;
        const personagem = await getPersonagemById(id);
        res.send(personagem);
    });

    // Rota Criar personagem
    app.post("/personagens", async (req, res) => {
        const objeto = req.body;
        
        if(!objeto || !objeto.nome || !objeto.imagemUrl){
            res.send("Objeto Inválido")
            return;
        }
        
        const insertCount = await personagens.insertOne(objeto);
    
        if(!insertCount){
            res.send("Ocorreu um erro");
            return;
        };
        res.send(objeto);
    });

    // Rota para dar update no personagem
    app.put("/personagens/:id", async (req, res) => {
        const id = req.params.id;
        const objeto = req.body;
        res.send(
            await personagens.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: objeto,
                }
            )
        );
    });

    // Rota para deletar o personagem
    app.delete("/personagens/:id", async (req, res) => {
        const id = req.params.id;

        res.send(
            await personagens.deleteOne({
                _id: ObjectId(id),
            })
        );
    });


    // Fazer a porta ser "ouvida"
    app.listen(port, () => {
        console.log(`App rodando em http://localhost:${port}`);
    });
})();