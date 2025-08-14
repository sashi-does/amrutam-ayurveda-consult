import express from "express";
import apiRoutes from "./routes/index";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/v1", apiRoutes);

app.get("/", (req, res) => {
  res.send("Hello");
});

// Only listen locally
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Running at port: ${port}`);
  });
}

export default app;
