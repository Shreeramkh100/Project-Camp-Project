import express from "express";
const app = express();

app.get('/',(req,res)=>{
    res.end("Tu kya kar raha hai mere bhai")
})

export default app;
