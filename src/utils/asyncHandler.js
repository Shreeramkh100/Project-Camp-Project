//Approach 1 : Promise
const asyncHandler = (requestHandler) => {
    console.log(requestHandler)
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}
// Approach 2 : Try Catch
// const asyncHandler=(fn)=>async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (err) {
//         res.status(err.code||500).json({
//             succes:false
//         }
//         )
//     }
// }

export default asyncHandler