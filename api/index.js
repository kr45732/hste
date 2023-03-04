const app = require("express")();
const bodyParser = require("body-parser")

let faunadb = require("faunadb")
let q = faunadb.query;
let client = new faunadb.Client({
    secret: process.env.FAUNA_ADMIN_KEY,
    endpoint: `https://${process.env.FAUNA_DB_DOMAIN}`,
});

app.use(bodyParser.text({ limit: '5mb' }));


app.get("/api/", async (req, res) => {
    res.json({ hello: "there" });
})

app.get("/api/:key", async (req, res) => {
    try {
        let query = await client.query(
            q.Get(
                q.Ref(q.Collection("hste"), req.params.key),
            )
        );

        res.header("Content-Type", "text/plain")
        res.header("Accept", "text/plain");
        if (query.data) {
            res.send(query.data.non_json_data);
        } else {
            res.send({});
        }
    } catch (error) {
        res.status(404).json({ message: "Document not found." });
    }
})

app.post("/api/", async (req, res) => {
    if (req.query?.key != process.env.KEY) {
        res.status(401).json({ message: "Unauthorized" })
    } else {
        let query = await client.query(
            q.Create(
                q.Collection("hste"),
                {
                    data: { non_json_data: req.body },
                },
            )
        );

        res.json({ key: query.ref.id });
    }
})

module.exports = app;
