const mongoose = require('mongoose');

const subSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: [30, 'Description too long.']
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration too short.']
  },
  date: Date
},{ _id : false });

const schema = mongoose.Schema({
  username : {
    type: String, 
    required: true,
    maxlength: [20, 'Username too long.']
  }, 
  id : String,
  log : [subSchema]
});

module.exports = mongoose.model("User", schema);