import express from 'express'
import {
    createArticle,
    getArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
} from '../controllers/articleController'

const router = express.Router()

router.post('/create', createArticle)
router.put('/update/:id', updateArticle)
router.get('/getarticle/:id', getArticle)
router.get('/allarticles', getAllArticles)
router.delete('/delete/:id', deleteArticle)
export default router
