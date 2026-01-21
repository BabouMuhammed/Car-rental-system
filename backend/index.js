const express=require('express')
const cors=require('cors')
const path=require('path')
const carRoutes=require('./routes/car')
const userRoutes=require('./routes/user')
const bookingRoutes=require('./routes/rental')
const connectDB=require('./config/dbConfig')
const dotenv=require('dotenv')
dotenv.config()
const app=express()
const PORT=process.env.PORT || 5000
// Connect to MongoDB
connectDB();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/api/cars',carRoutes)
app.use('/api/auth',userRoutes) // Map /api/auth to userRoutes for login/register
app.use('/api/users',userRoutes) // Map /api/users to userRoutes for profile
app.use('/api/rentals',bookingRoutes) // Map /api/rentals to bookingRoutes


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
