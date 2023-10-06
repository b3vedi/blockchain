'use strict'

const IPFS = require('ipfs')
const uint8ArrayConcat = require('uint8arrays/concat')
const all = require('it-all')

const mainDeployer = require('./assets/MainDeployer.json');
const userToken = require('./assets/UserToken.json');

var node;
var photoMatrix = {};
var account;
var contractaddress = '0xb993D5191Dea3d0713BbBe10F1f670514e55B4Ee';

window.addEventListener('load', async () => {

  if (typeof window.ethereum !== 'undefined') {
    console.log("MetaMask is Available :) !");
  }

  // Modern DApp browsers
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);

    // To prevent the page reloading when the MetaMask network changes
    ethereum.autoRefreshOnNetworkChange = false;

    // To Capture the account details from MetaMask
    const accounts = await ethereum.enable();
    account = accounts[0];

  }
  // Legacy DApp browsers
  else if (window.web3) {
    //window.web3 = new Web3(web3.currentProvider);
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/cbd9dc11b30147e9a2cc974be655ef7c"));
  }
  // Non-DApp browsers
  else {
    console.log('Non-Ethereum browser detected. Please install MetaMask');
  }

});


function set_details() {
  var mainDeployerContract = new web3.eth.Contract(mainDeployer, contractaddress, { from: account, gasPrice: '5000000', gas: '5000000' });

  var name = document.getElementById("name").value;
  var dob = document.getElementById("birthday").value;
  var gender = document.getElementById("gender").value;
  var cnumber = document.getElementById("contact_no").value;
  var email = document.getElementById("email_id").value;
  var bgroup = document.getElementById("bloodgroup").value;
  var city = document.getElementById("city").value;
  var state = document.getElementById("state").value;
  var photo = photoMatrix['image'] ? photoMatrix['image'] : "";
  var photo1 = photoMatrix['image1'] ? photoMatrix['image1'] : "";
  var photo2 = photoMatrix['image2'] ? photoMatrix['image2'] : "";
  var photo3 = photoMatrix['image3'] ? photoMatrix['image3'] : "";
  var photo4 = photoMatrix['image4'] ? photoMatrix['image4'] : "";

  mainDeployerContract.methods.createUserToken(name, dob, gender, cnumber, email, bgroup, city, state, photo, photo1, photo2, photo3, photo4).send(function (err, result) {
    if (err) { console.log(err); }
    if (result) {
      document.getElementById("result").innerHTML = result;
    }
  });
}

async function getUserTokenAddr() {
  return new Promise((resolve, reject) => {
    var mainDeployerContract = new web3.eth.Contract(mainDeployer, contractaddress, { from: account, gasPrice: '5000000', gas: '5000000' });
    mainDeployerContract.methods.getUserTokenAddr().call(function( err, result) {
      if (err) reject(err);
      if (result) resolve(result);
    });
  })
}

async function show_details() {
  var addr = await getUserTokenAddr();

  var myContract = new web3.eth.Contract(userToken, addr, { from: account, gasPrice: '5000000', gas: '500000' });
  var result = myContract.methods.getuserDetails().call(function (err, result) {

    if (err) { console.log(err); }
    if (result) {
      document.getElementById("get_name").innerHTML = result[0];
      document.getElementById("get_dob").innerHTML = result[1];
      document.getElementById("get_gender").innerHTML = result[2];
      document.getElementById("get_number").innerHTML = result[3];
      document.getElementById("get_email").innerHTML = result[4];
      document.getElementById("get_bloodgroup").innerHTML = result[5];
      document.getElementById("get_city").innerHTML = result[6];
    }
  });
  
  myContract.methods.getUserfileDetails().call(function (err,fileDetails) {

    if (err) { console.log(err); }
    if (fileDetails) {
      document.getElementById("get_state").innerHTML = fileDetails[0];
      document.getElementById("get_photo").innerHTML = getFile(fileDetails[1], 'get_photo');
      document.getElementById("get_leftThumb").innerHTML = getFile(fileDetails[2], 'get_leftThumb');
      document.getElementById("get_rightThumb").innerHTML = getFile(fileDetails[3], 'get_rightThumb');
      document.getElementById("get_leftEye").innerHTML = getFile(fileDetails[4], 'get_leftEye');
      document.getElementById("get_rightEye").innerHTML = getFile(fileDetails[5], 'get_rightEye');
    }
  });
}


async function uploadFile(file) {

  const fileAdded = await node.add({
    path: file.name,
    content: file
  }, {
    wrapWithDirectory: true
  })

  // As we are wrapping the content we use that hash to keep
  // the original file name when adding it to the table
  return (fileAdded.cid.toString());
}

async function getFile(cid, id) {

  for await (const file of node.get(cid)) {
    if (file.content) {
      const content = uint8ArrayConcat(await all(file.content))

      await appendFile(content, id)
    }
  }
}

function appendFile(data, id) {
  const file = new window.Blob([data], { type: 'application/octet-binary' })
  const url = window.URL.createObjectURL(file)
  document.getElementById(id).setAttribute('src', url);
}

async function catchFile(e, id) {
  photoMatrix[id] = await uploadFile(e.target.files[0]);
  console.log(photoMatrix);
}

async function start() {
  node = await IPFS.create();

  if (document.getElementById('image')) {
    document.getElementById("image").addEventListener("change", (e) => catchFile(e, 'image'));
    document.getElementById("image1").addEventListener("change", (e) => catchFile(e, 'image1'));
    document.getElementById("image2").addEventListener("change", (e) => catchFile(e, 'image2'));
    document.getElementById("image3").addEventListener("change", (e) => catchFile(e, 'image3'));
    document.getElementById("image4").addEventListener("change", (e) => catchFile(e, 'image4'));
    document.getElementById('submitBtnIndex').addEventListener("click", () => set_details());
  } else {
    document.getElementById('getDetailsBtn').addEventListener("click", () => show_details());
  }
}

start();