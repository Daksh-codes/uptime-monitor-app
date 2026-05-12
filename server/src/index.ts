import express, {Request, Response} from 'express'
import cors from 'cors'
import userRouter from './routes/userRoutes'

const app = express()
app.use(express.json())
app.use(cors());

app.get('/' , (req:Request , res:Response) => {
    res.send("OK, working")
})
app.use('/api/' , userRouter )

app.listen(3000, () => {
    console.log(`server running on port 3000, http://localhost:3000`)
})