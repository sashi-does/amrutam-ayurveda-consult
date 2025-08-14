"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", index_1.default);
app.get("/", (req, res) => {
    res.send("Hello");
});
// Only listen locally
if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
        console.log(`Running at port: ${port}`);
    });
}
exports.default = (req, res) => {
    app(req, res);
};
//# sourceMappingURL=app.js.map