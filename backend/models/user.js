/* eslint-disable spaced-comment */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    dropDups: true,
  },
  //index access items based on email in the collectino

  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
