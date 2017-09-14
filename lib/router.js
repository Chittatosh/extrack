const router = require('express').Router();
const User = require('./schema');
const shortId = require('short-mongo-id');

router.get("/users", (req, res) => {
  User.find(function(err, userArr) {
    if (err) {
      res.send(err.message);
      return;
    }
    res.json(userArr.map(obj => ({
      "username" : obj.username,
      "_id": obj.id
    })));
  });
});

router.get("/log", (req, res) => {
  let RQ = req.query;
  console.log("RQ: ", RQ);
  User.findOne({ id: RQ.userId }, (err, doc) => {
    if (err) {
      res.send(err.message);
      return;
    }
    if (doc) { // Found 
      let logArr = doc.log;
      if(RQ.from) logArr = logArr.filter(obj => obj.date >= new Date(RQ.from));
      if(RQ.to) logArr = logArr.filter(obj => obj.date <= new Date(RQ.to));
      if(RQ.limit) logArr = logArr.slice(0, RQ.limit);
      res.json({
        username: doc.username,
        _id: doc.id,
        count: logArr.length,
        log: logArr
      });
    } else { // Not Found, Create New 
      res.send('Missing userId in query.');
    }
  });
});

router.post("/new-user", (req, res) => {
  const postUser = req.body.username;
  User.findOne({ username: postUser }, (err, doc) => {
    if (err) {
      res.send(err.message);
      return;
    }
    if (doc) { // Found
      res.json({
        username: doc.username,
        _id: doc.id
      });
    } else { // Not Found, Create New 
      let newUser = new User({ username: postUser });
      newUser.id = shortId(newUser._id);
      newUser.save(function(err, savedUser) {
        if (err) {
          res.send(err.message);
          return;
        }
        res.json({
          username: savedUser.username,
          _id: savedUser.id
        });
        console.log('savedUser: ', savedUser);
      });
    }
  });
});

//console.log("RB: ", RB);
router.post("/add", (req, res) => {
  let RB = req.body;
  let postDt = RB.date ? new Date(RB.date) : new Date();
  let postEx = {
    description: RB.description,
    duration: RB.duration,
    date: postDt
  };
  User.findOneAndUpdate(
    { id: RB.userId }, 
    { $push: { 'log': postEx } }, 
    { runValidators: true }, 
    (err, doc) => {
      if (err) {
        res.send(err.message);
        return;
      }
      if (doc) { // Found and Updated .message
        res.json({
          username: doc.username,
          _id: doc.id,
          description: postEx.description,
          duration: postEx.duration,
          date: postEx.date
        });
      } else { // Not Found
        res.send('UserId not found!');
      }
    }
  );
});

module.exports = router;