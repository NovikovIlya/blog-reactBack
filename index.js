import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {
  loginValidation,
  registerValidation,
  postCreateValidation,
} from './validations/validations.js';
import cors from 'cors';

import { checkAuth, handleErrors } from './utils/index.js';
import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('DB ok');
  })
  .catch((error) => {
    console.log('DB error!', error);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

//Позволяет читать json в запросах
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World!ttt');
});

app.post('/auth/login', loginValidation, handleErrors, UserController.login);
app.post('/auth/register', registerValidation, handleErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);
app.get('/posts/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleErrors, PostController.update);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('server OK');
});
