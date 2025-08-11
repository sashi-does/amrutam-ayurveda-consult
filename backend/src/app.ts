import express from "express";
import apiRoutes from "./routes/index.ts";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1", apiRoutes);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log(`Running at port: ${port}`);
});
