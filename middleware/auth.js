import jwt from "jsonwebtoken";

export const auth = async(req,res,next)=>{
    
        
try{
    let {token} = req.cookies;
    if(!token){
    return res.status(401).json({message:"Unauthorized User..."});
    }
    let decode = jwt.verify(token,process.env.TOKEN_SECRET);
    req.user = decode;
    next();

    }catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!!" });
    }
}