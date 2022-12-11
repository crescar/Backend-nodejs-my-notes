const {Users} = require('../../models/index')
const {Notebooks} = require('../../models/index')
const {Notes} = require('../../models/index')
const { sequelize } = require('../../models/index')
const md5 = require('md5');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const controllers = {}

//------------middleware---------------------
const verifyToken = require('../middlewares/verifyToken');

controllers.registerUser = async (req, res) =>{
    const transaction = await sequelize.transaction()
    try {
        
        const { firstName, lastName, email, password } = req.body;
        const verifyUserEmail = await Users.findOne({
            attributes:["id"],
            where:{
                email: md5(email)
            }
        })
        if(!verifyUserEmail){
            let newUser = await Users.create(
                {
                    firstName:firstName,
                    lastName:lastName,
                    email:md5(email),
                    password:md5(password)
                },
                {
                    transaction:transaction
                }
            )
            if(!newUser){
                return res.status(404).json({
                    message:"error create user",
                    continue:false
                })
            }
            let response = jwt.sign(newUser.dataValues,process.env.JWT_SECRECT_KEY,(error, token)=>{
                if(error){
                    return res.status(403).json({
                        message:"error create token validation",
                        continue:false
                    })
                }
                return res.status(200).json({
                    message:'created successfull',
                    continue: true,
                    token: token
                })
            })
            await transaction.commit()
            return response;

        }
        return res.status(403).json({
            message:'Email in use',
            continue: false
        })
    } catch (error) {
        await transaction.rollback()
        return res.status(404).json({
            message:`Error: ${error}`,
            continue: false
        })
    }
}

controllers.login = async (req, res) =>{
    try {
        const {email, password} = req.body
        let findUser = await Users.findOne({
            attributes:["id","firstName","lastName"],
            where:{
                email:md5(email), 
                password: md5(password)
            }
        });
        if(!findUser){
            return res.status(404).json({
                message:'auth error email or password Wrong',
                auth: null,
                token: null,
            })
        }
        return jwt.sign(findUser.dataValues,process.env.JWT_SECRECT_KEY,(error, token)=>{
            if(error){
                return res.status(404).json({
                    message:"auth error",
                    auth:null,
                    toke: null
                })
            }
            return res.status(200).json({
                message:'Auth successfull',
                continue: true,
                token: token
            })
        })
        
    } catch (error) {
        return res.status(404).json({
            message:`Error: ${error}`
        })
    }
}

controllers.deleteUser = async (req, res) =>{
    const transaction = await sequelize.transaction();
    try {
        const {id} = req.params;
        const {token} = req.body;
        const verify = await verifyToken(token)
        if(id == verify.infoUser.id && verify.auth){
            const deleteUser = await Users.findOne({
                where:{
                    id:id
                }
            })
            if(deleteUser){
                await deleteUser.destroy({},{
                    transaction
                }); 
                let notebooks = await Notebooks.findAll({
                    attributes:["id"],
                    where:{
                        user_id:id
                    }
                })
                if (notebooks) {
                    let notebook_id = []
                    notebooks.forEach(async notebook => {
                        notebook_id.push(notebook.id)
                        let notes = await Notes.findAll({
                            attributes:["id"],
                            where:{
                                user_id:id,
                                notebook_id:notebook.id
                            }
                        })
                        if(notes){
                            let note_id =[]
                            notes.forEach(note => {
                                note_id.push(note.id)
                            });
                            await Notes.destroy({
                                where:{
                                    id:note_id
                                }
                            },{transaction:transaction})
                        } 
                        
                    });
                    await Notebooks.destroy({
                        where:{
                            id: notebook_id
                        }
                    }, {transaction:transaction});
                }
                await transaction.commit()
                return res.status(200).json({
                    message:'deleted user successfull'
                })
            }
            return res.status(404).json({
                message:`User not found`
            })
        }
        return res.status(404).json({
            message:`No auth`
        })
        
    } catch (error) {
        await transaction.rollback()
        return res.status(404).json({
            message:`Error: ${error}`,
            continue: false
        })
    }

}

controllers.getUser = async (req,res) =>{
    const {token} = req.body;
    const verify = await verifyToken(token);
    if(verify.auth){
        const findUser = await Users.findOne({
            attributes:["id","firstName","lastName"],
            where:{
                id:verify.infoUser.id
            }
        })
        if (findUser) {
            return res.status(200).json({
                message:'user find',
                auth: true,
                infoUser: findUser.dataValues
            })
        }
        return res.status(404).json({
            message:`User not found`,
            auth: false
        })
    }
    return res.status(404).json({
        message:`No auth`,
        auth:false
    })
}


module.exports = controllers