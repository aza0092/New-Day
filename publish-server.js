const {exec} = require('child_process');
const path = require('path');
const os = require('os');

const pemName = 'todoEc.pem';
const ip = '3.18.230.238';

async function publishServer (){
  try {
    console.log('0/1');
    await sendFile(`scp -i ${path.resolve(os.homedir(), pemName)} ./server/index.js ubuntu@${ip}:/home/ubuntu/server`);
    console.log('1/1 Done');
  } catch (e) {
    console.log('Error');
    console.log(e.message);
  }
}

function sendFile(command){
  return new Promise((resolve, reject) => {
    exec(command, (err, res) => {
      if (err) reject(err);
      resolve();
    })
  });
}

publishServer();