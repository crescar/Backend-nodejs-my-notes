const { json } = require('express');
const {Notebooks} = require('../../models/index')
const {Notes} = require('../../models/index')
const { sequelize } = require('../../models/index')
require('dotenv').config();

//------------middleware---------------------
const verifyToken = require('../middlewares/verifyToken');


const controllers = {}

controllers.getNotebooks = async (req, res) =>{
    const {token} = req.body;
    const verify = await verifyToken(token)
    if(verify.auth){
        let notebooks = await Notebooks.findAll({
            attributes:["id","user_id","notebook_name"],
            where:{
                user_id: verify.infoUser.id
            }
        })
        if(notebooks){
            return res.status(200).json({
                message: 'Notebooks found',
                notebooks: notebooks
            })
        }
        return res.status(404).json({
            message:`Notebooks not found`
        })
    }
    return res.status(403).json({
        message:'No auth',
        continue: false
    })

}

controllers.getNotebook = async (req, res) =>{
    const {id} = req.params;
    const {token} = req.body;
    const verify = await verifyToken(token)
    if(verify.auth){
        let notebook = await Notebooks.findOne({
            attributes:["id","user_id","notebook_name"],
            where:{
                id: id,
                user_id: verify.infoUser.id
            }
        })
        if(notebook){
            return res.status(200).json({
                message: 'Notebook found',
                notebook: notebook
            })
        }
        return res.status(404).json({
            message:`Notebook not found`
        })
    }
    return res.status(403).json({
        message:'No auth',
        continue: false
    })
}

controllers.createNotebook = async (req,res) =>{
    const {token, notebook_name} = req.body
    const transaction = await sequelize.transaction()
    try {
        const verify = await verifyToken(token)
        if(verify.auth){
            let notebook = await Notebooks.create(
                {
                    user_id: verify.infoUser.id,
                    notebook_name:notebook_name
                },
                {transaction:transaction}
            )
            await transaction.commit();
            return res.status(200).json({
                message:'Note Create Successfully',
                notebook_id: notebook.dataValues.id
            })
        }
        return res.status(403).json({
            message:'No auth',
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

controllers.updateNotebook = async (req,res) =>{
    const transaction = await sequelize.transaction()
    const {id} = req.params;
    const {token, notebook_name} = req.body;
    const verify = await verifyToken(token)
    try {
        if(verify.auth){
            let notebook = await Notebooks.findOne({
                where:{
                    user_id: verify.infoUser.id,
                    id:id
                }
            })
            if(notebook){
                notebook.update({
                    notebook_name:notebook_name,
                    updatedAt: new Date()
                },{}, {transaction:transaction}
                )
                await transaction.commit()
                return res.status(200).json({
                    message: 'Notebook update successfully',
                    notebooks: notebook
                })
            }
            return res.status(404).json({
                message:`Notebooks not found`
            })
        }
        return res.status(403).json({
            message:'No auth',
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

controllers.deleteNotebook = async(req,res) => {
    const transaction = await sequelize.transaction()
    const {id} = req.params;
    const {token} = req.body;
    const verify = await verifyToken(token)
    try {
        if(verify.auth){
            let notebook = await Notebooks.findOne({
                where:{
                    user_id: verify.infoUser.id,
                    id:id
                }
            })
            if(notebook){
                notebook.destroy({}, {transaction:transaction})
                let notes = await Notes.findAll({
                    attributes:["id"],
                    where:{
                        notebook_id:id,
                        user_id: verify.infoUser.id
                    }
                })
                if(notes){
                    let id_notes=[]
                    notes.forEach(note => {
                        id_notes.push(note.id)
                    });
                    await Notes.destroy({
                        where:{
                            id:id_notes,
                            notebook_id:id
                        }
                    },{
                        transaction:transaction
                    })
                }
                await transaction.commit()
                return res.status(200).json({
                    message: 'Notebook deleted successfully',
                    notebooks: notebook,
                    notes:notes
                })
            }
            return res.status(404).json({
                message:`Notebook not found`
            })
        }
        return res.status(403).json({
            message:'No auth',
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

module.exports = controllers