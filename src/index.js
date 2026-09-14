import app from "./app.js"
import DBConnection from "./db/dbConnection.js";
const PORT = process.env.PORT || 1002;

DBConnection()
     .then(() => {
          app.listen(PORT, () => {
               console.log(`Server is listening on port ${PORT}`)
          })
     })
     .catch((error) => {
          console.error("DB Connection Failed ❌ :", error)
          process.exit(1); //Terminates Node 
     })