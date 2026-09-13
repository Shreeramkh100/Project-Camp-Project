import express from "express";
const PORT=process.env.PORT||1002;

const app = express();

app.get('/',(req,res)=>{
    res.end("Tu kya kar raha hai mere bhai")
})

app.listen(PORT,()=>{
     console.log(`Example app listening on port ${PORT}`)
})