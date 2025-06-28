import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import {connectDB} from "./config/db.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT , () => {
        console.log("Server started on port : " , process.env.PORT);
    });
})
.catch((error) => {
    console.log("Server connection failed !" , error);
});
