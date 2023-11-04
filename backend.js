const express = require('express');
const path = require('path');
const { ethers } = require('ethers');

const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(express.json());

const users = {};

app.post('/verifyWallet', (req, res) => {
  const { fromAddress, signature, nonce } = req.body;
  try {
    const siteID = 'Web3 Session Key Demo';
    const message = `I am proving ownership of this address: ${nonce} ${siteID}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() === fromAddress.toLowerCase()) {
      const sessionKey = `session_${new Date().getTime() + '' + (Math.round(Math.random() * 9999))}`;
      if (users[fromAddress]) {
        users[fromAddress].sessionKey = sessionKey;
      } else {
        users[fromAddress] = {
          sessionKey,
          name: 'unknown',
        }
      }
      console.log(`Session Key Created: ${sessionKey}`);
      res.json({ isValid: true, sessionKey });
    } else {
      res.status(401).json({ isValid: false, error: "Invalid signature." });
    }
  } catch (error) {
    res.status(500).json({ isValid: false, error: error.message });
  }
});

app.post('/setName', (req, res) => {
  const { fromAddress, sessionKey, newName } = req.body;
  if (users[fromAddress] && users[fromAddress].sessionKey == sessionKey) {
    users[fromAddress].name = newName;
    console.log(`Name set: ${users[fromAddress].name}`);
    res.json({ isValid: true });
  } else {
    res.status(401).json({ isValid: false, error: "Invalid session key." });
  }
});

app.post('/getName', (req, res) => {
  const { fromAddress, sessionKey } = req.body;
  if (users[fromAddress] && users[fromAddress].sessionKey == sessionKey) {
    console.log(`Name returned: ${users[fromAddress].name}`);
    res.json({ isValid: true, name: users[fromAddress].name });
  } else {
    res.status(401).json({ isValid: false, error: "Invalid session key." });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
