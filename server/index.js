const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const jwtSecret = 'newapp_secrettoken';
const axios = require('axios');

const SENDGRID_API_KEY = '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';

async function sendMail(sender, receiver, title, message){
  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{to: [{email: receiver}]}],
        from: {email: sender},
        subject: title,
        content: [{type: "text/plain", value: message}]
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`
        }
      }
    );
    return true;
  } catch (e) {
    console.log('email error', e.message);
    return false;
  }
}

function sendConfirmMail(userId, email){
  let currenttick = new Date().getTime();
  let margin2hours = 2 * 60 * 60 * 1000;
  let lasttick = currenttick + margin2hours;
  let endpoint = 'http://localhost:3001/api/user/checkconfirmemail';
  let url = `${endpoint}?t=${cipherData(lasttick.toString())}&u=${cipherData(userId.toString())}`;
  sendMail('karadumanhakan1@gmail.com', email, 'Confirm your email', `<p>Click <a href="${url}">this link</a> to confirm your e-mail. </p>`);
}

function cipherData(data){
  const cipher = crypto.createCipher('aes192', 'taskapp');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decipherData(data){
  const decipher = crypto.createDecipher('aes192', 'taskapp');
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function verifyToken(token){
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, tokenVerified) => {
      if (err) resolve(false);
      else resolve(tokenVerified);
    });
  });
}

function getHash(value) {
  const hash = crypto.createHash('sha256');
  hash.update(value);
  return hash.digest('hex');
}

// Database

// was 115500
const db = new Sequelize('Task', 'root', 'p@ssword123456', {
  host : 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

let deadlineTimeouts = {};

db.authenticate()
  .then(() => {
    scheduleReminderForAllUsers();
  })
  .catch((err) => {
    console.error('Not Connected', err.message);
  });

async function scheduleReminderForAllUsers(){
  let tasks = await TaskModel.findAll({});
  tasks = tasks.map(t => t.toJSON());
  for (let task of tasks) {
    if (task.deadline == null) continue;
    if (!deadlineTimeouts[task.userId]) {
      deadlineTimeouts[task.userId] = [];
    }
    let diff = task.deadline.getTime() - new Date().getTime();
    if (diff <= 0) continue;
    let hourInMs = 60 /*Minute*/ * 60 /*Seconds*/ * 1000 /*Milliseconds*/;
    deadlineTimeouts[task.userId].push(setTimeout(() => {
      // todo left here
      sendMail('sender@gmail.com', )
    }, diff - hourInMs));
  }
}

async function scheduleReminderForUser(userId){
  if (deadlineTimeouts[userId]) {
    deadlineTimeouts[userId].forEach(timeout => clearTimeout(timeout));
  } else {
    deadlineTimeouts[userId] = [];
  }
  let tasks = await TaskModel.findAll({where: {userId}});
  tasks = tasks.map(t => t.toJSON());
  for (let task of tasks) {
    if (task.deadline == null) continue;
    let diff = task.deadline.getTime() - new Date().getTime();
    if (diff <= 0) continue;
    let hourInMs = 60 /*Minute*/ * 60 /*Seconds*/ * 1000 /*Milliseconds*/;
    deadlineTimeouts[userId].push(setTimeout(() => {}, diff - hourInMs));
  }
}

const UserModel = db.define('user', {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: Sequelize.STRING
  },
  isEmailConfirmed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

const TaskModel = db.define('Task', {
  userId: Sequelize.BIGINT(11),
  category: Sequelize.STRING,
  name: Sequelize.STRING,
  content: Sequelize.STRING,
  isCompleted: Sequelize.BOOLEAN,
  deadline: Sequelize.DATE
});

db.sync();

async function auth(req, res, next){
  try {
    let {token} = req.headers;
    if (!token) {
      req.user = null;
      return res.send({error: 'Unauthorized'});
    }
    let verifiedToken = await verifyToken(token);
    if (!verifiedToken) {
      req.user = null;
      return res.send({error: 'Unauthorized'});
    }
    req.user = await UserModel.findOne({where: {email: verifiedToken.email}});
    next();
  } catch (e) {
    console.log('Auth Error', e.message);
    req.user = null;
    res.status(500).send({error: 'Server Error'});
  }
}

const app = express();
let staticPath = '';
if (process.argv.includes('local')) {
  staticPath = path.resolve(process.argv[1], '..', 'public');
} else {
  staticPath = `/home/ubuntu/server/build`;
}
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '4096mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '4096mb' }));
app.use(express.static(staticPath));

// User API Endpoints
app.post('/api/user/signup', async (req, res) => {
  try {
    let {email, password, passwordConfirmation} = req.body;
    if (password !== passwordConfirmation) return res.send({error: 'Passwords do not match'});
    if (password.length < 6 || passwordConfirmation.length < 6) return res.send({error: 'Password should be at least 6 characaters'});
    let user = await UserModel.findOne({where: {email}});
    if (user) return res.send({error: 'Email address is already taken'});
    let userDoc = await UserModel.create({email, passwordHash: getHash(password)});
    sendConfirmMail(userDoc.id, email);
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.post('/api/user/signin', async (req, res) => {
  try {
    let {email, password, rememberMe} = req.body;
    const user = await UserModel.findOne({where: {email}});
    if (!user) return res.send({error: 'User with email not found'});
    if (user.passwordHash !== getHash(password)) return res.send({error: 'Password is not correct'});
    let cookieObject = {
      userId: user.id,
      email,
      rememberMe
    };
    let token = jwt.sign(cookieObject, jwtSecret);
    const shortTokenTime = 7 * 24 * 60 * 60 * 1000;
    const longTokenTime = 30 * 24 * 60 * 60 * 1000;
    let maxAge = rememberMe ? longTokenTime : shortTokenTime;
    res.send({result: {token, maxAge}});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/checktoken', auth, async (req, res) => {
  try {
    let {token} = req.headers;
    let verifiedToken = await verifyToken(token);
    if (!!verifiedToken) {
      res.send({result: true});
    } else {
      res.send({error: 'Invalid Token'});
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/resetpassword', async (req, res) => {
  try {

  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/sendconfirmemail', auth, async (req, res) => {
  try {
    sendConfirmMail(req.user.id, req.user.email);
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/checkconfirmemail', async (req, res) => {
  try {
    let currentTick = new Date().getTime();
    let margin = 2 * 60 * 60 * 1000;
    let sentTime = parseInt(decipherData(req.query.t));
    if (sentTime > currentTick + margin){
      return res.send({error: 'Link is expired'});
    }
    await UserModel.update({isEmailConfirmed: true}, {where: {id: decipherData(req.query.u)}});
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.post('/api/user/setpassword', auth, async (req, res) => {
  try {
    // oldPassword, newPassword, newPasswordConfirmation
    let {oldPassword, newPassword, newPasswordConfirmation} = req.body;
    let user = await UserModel.findByPk(req.user.id);
    if (!user){
      return res.send({error: 'User not found'});
    }
    if (newPassword !== newPasswordConfirmation) {
      return res.send({error: 'New passwords don\'t match'});
    }
    if (getHash(oldPassword) !== user.passwordHash) {
      return res.send({error: 'Old password is wrong'});
    }
    await UserModel.update({passwordHash: getHash(newPassword)}, {where: {id: req.user.id}});
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/delete', auth, async (req, res) => {
  try {
    await TaskModel.destroy({where: {userId: req.user.id}});
    await UserModel.destroy({where: {id: req.user.id}});
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

app.get('/api/user/info', auth, async (req, res) => {
  try {
    let userDoc = await UserModel.findByPk(req.user.id);
    res.send({result: {email: userDoc.email, isEmailConfirmed: userDoc.isEmailConfirmed}});
  } catch (e) {
    console.log(e.message);
    res.status(500).send({error: 'Server error'});
  }
});

// Tasks API Endpoints

app.post('/api/task/add', auth, async (req, res) => {
  try {
    let {name, content, category, isCompleted, deadline} = req.body;
    let x = await TaskModel.create({userId: req.user.id, name, content, category, isCompleted, deadline});
    await scheduleReminderForUser(req.user.id);
    res.send({result: x.id});
  } catch (e) {
    console.log(e.message);
    res.send({error: 'Server error'});
  }
});

app.post('/api/task/update', auth, async (req, res) => {
  try {
    let {id, name, content, category, isCompleted, deadline} = req.body;
    await TaskModel.update({name, content, category, isCompleted, deadline}, {where: {userId: req.user.id, id}});
    await scheduleReminderForUser(req.user.id);
    res.send({result: true});
  } catch (e) {
    console.log(e.message);
    res.send({error: 'Server error'});
  }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    let tasks = await TaskModel.findAll({where: {userId: req.user.id}});
    res.send({result: tasks});
  } catch (e) {
    console.log(e.message);
    res.send({error: 'Server error'});
  }
});

app.get('*', async (req, res) => {
  res.sendFile('index.html', { root: staticPath });
});

app.listen(80, () => console.log('Server is listening on port 80 for http'));