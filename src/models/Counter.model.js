// models/Counter.js
import mongoose from 'mongoose';
import applyBase from './Base.model.js';

const { Schema } = mongoose;

const CounterSchema = new Schema({
  _id: { type: String },           // name of the counter, e.g. 'employeeId'
  seq: { type: Number, default: 0 }
});
applyBase(CounterSchema);
export default mongoose.model('Counter', CounterSchema);

