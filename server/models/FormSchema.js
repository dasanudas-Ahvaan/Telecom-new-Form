import mongoose from 'mongoose';

const formSchemaSchema = new mongoose.Schema({
  schemaIdentifier: { type: String, default: 'main', unique: true },
  fields: { type: Array, default: [] }
});

const FormSchema = mongoose.model('FormSchema', formSchemaSchema);
export default FormSchema;