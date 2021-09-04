const express = require("express");
const router = express.Router();

// middleware para especificar que é esse router que vamos utilizar
router.use(function timelog(req, res, next) {
    next();
});

router.get("/",  async (req, res) => {
    res.send({ info: "Olá Mundo!" });
});

module.exports = router;