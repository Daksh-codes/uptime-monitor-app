import express, {Request, Response} from 'express'
import { addUser, getUser, loginUser, deleteUser, getCurrentUser } from '../controller/userController'
import authMiddleware from '../Middleware/authMiddleware'

const router = express.Router()

router.post('/' , addUser )
router.post('/login', loginUser)
router.get('/profile', authMiddleware, getCurrentUser)
router.get('/user/:id', getUser)
router.delete('/user/:id' , deleteUser)


export default router;