import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import userRoute from './routes/user';
import uploadRoute from './routes/upload';
import productRoute from './routes/product';
import orderRoute from './routes/order';

const mongodbUrl = config.MONGODB_URL;
mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log(error.reason));

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoute);
app.use('/api/uploads', uploadRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.get('/api/paypal/clientId', (req, res) => {
  res.send({ clientId: config.PAYPAL_CLIENT_ID });
});

app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, '/../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

//for handeling errors using asyncHandler, depend on status in routers, 400 Bad Request response and 500 error not clear
app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status);
  res.send({ message: err.message });
});

app.listen(config.PORT, () => {
  console.log('Server started at http://localhost:5000');
});
