const electron = window.require('electron');
const remote = electron.remote;

const databaseHost = remote.getGlobal('database').ip;

const getJava = async id => {
  try {
    const response1 = await fetch(`http://${databaseHost}:5000/java/100/2`);
    const jsonData1 = await response1.json();
    console.log('RECEIVED THE RESPONSE!')
    console.log(jsonData1)
  }
  catch (e) {

  }
}
