const {Notes} = require('../../models/index')
const { sequelize } = require('../../models/index')
require('dotenv').config();

//------------middleware---------------------
const verifyToken = require('../middlewares/verifyToken');

const controllers = {}

controllers.getNotes = async (req, res) =>{
    const {token, notebook_id} = req.body;
    const verify = await verifyToken(token)
    if(verify.auth){
        let notes = await Notes.findAll({
            attributes:["id","user_id","notebook_id","note_name","note_content"],
            where:{
                user_id: verify.infoUser.id,
                notebook_id:notebook_id
            }
        })
        if(notes){
            return res.status(200).json({
                message: 'Notes found',
                notes: notes
            })
        }
        return res.status(404).json({
            message:`Notes not found`
        })
    }
    return res.status(403).json({
        message:'No auth',
        continue: false
    })
}

controllers.getNote = async (req, res) =>{
    const {id} = req.params;
    const {token, notebook_id} = req.body;
    const verify = await verifyToken(token)
    if(verify.auth){
        let note = await Notes.findOne({
            attributes:["id","user_id","notebook_id","note_name","note_content"],
            where:{
                id: id,
                user_id: verify.infoUser.id,
                notebook_id:notebook_id
            }
        })
        if(note){
            return res.status(200).json({
                message: 'Notebook found',
                note: note
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
controllers.createNote = async (req, res) =>{
    const {token, notebook_id,note_name,note_content} = req.body
    const transaction = await sequelize.transaction()
    try {
        const verify = await verifyToken(token)
        if(verify.auth){
            let note = await Notes.create(
                {
                    user_id: verify.infoUser.id,
                    notebook_id: notebook_id,
                    note_name:note_name,
                    note_content:note_content
                },
                {transaction:transaction}
            )
            await transaction.commit();
            return res.status(200).json({
                message:'Note Create Successfully',
                note_id: note.id
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

controllers.updateNote = async (req, res) =>{
    const transaction = await sequelize.transaction()
    const {id} = req.params;
    const {token, notebook_id,note_name,note_content} = req.body;
    const verify = await verifyToken(token)
    try {
        if(verify.auth){
            let note = await Notes.findOne({
                where:{
                    user_id: verify.infoUser.id,
                    id:id,
                    notebook_id:notebook_id
                }
            })
            if(note){
                note.update({
                    note_name:note_name,
                    note_content:note_content,
                    updatedAt: new Date()
                },{}, {transaction:transaction}
                )
                await transaction.commit()
                return res.status(200).json({
                    message: 'Note update successfully',
                    note: note
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

controllers.deleteNote = async (req, res) =>{
    const transaction = await sequelize.transaction()
    const {id} = req.params;
    const {token, notebook_id} = req.body;
    const verify = await verifyToken(token)
    try {
        if(verify.auth){
            let note = await Notes.findOne({
                where:{
                    user_id: verify.infoUser.id,
                    id:id,
                    notebook_id:notebook_id
                }
            })
            if(note){
                note.destroy({}, {transaction:transaction}
                )
                await transaction.commit()
                return res.status(200).json({
                    message: 'Note deleted successfully',
                    note: note
                })
            }
            return res.status(404).json({
                message:`Note not found`
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