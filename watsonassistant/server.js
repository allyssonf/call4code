const path = require('path');
const express = require('express');
const cors = require('cors');
const fallback = require('./node_modules/express-history-api-fallback');
const IamTokenManager = require('ibm-watson/auth').IamTokenManager;
const IamAuthenticator = require('ibm-watson/auth').IamAuthenticator;
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

if (!process.env.WA_TTS_KEY || 
    !process.env.WA_TTS_URL || 
    !process.env.WA_STT_KEY || 
    !process.env.WA_STT_URL) {
  throw new Error("Missing required tokens! Please check your .env file or deplopyment configuration!");
}

app = express();
app.use(cors());
app.use(express.json());

port = process.env.PORT || 3001;

const root = path.join(__dirname, './build');

// // Serve static files built by React
app.use(express.static(root));

// Serve React main application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./build", "index.html"));
});

const sttAuthenticator = new IamTokenManager({
  apikey: process.env.WA_STT_KEY
});

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({ apikey: process.env.WA_TTS_KEY }),
  serviceUrl: process.env.WA_TTS_URL
});

const assistant = new AssistantV2({
  authenticator: new IamAuthenticator({ apikey: process.env.WA_KEY }),
  serviceUrl: 'https://api.us-south.assistant.watson.cloud.ibm.com',
  version: '2018-09-19'
});

app.get('/api/speech-to-text/token', function (req, res) {
  return sttAuthenticator
  .requestToken()
  .then(({ result }) => {
      res.json({ accessToken: result.access_token, 
                 tts_url: process.env.WA_TTS_URL, 
                 tts_key: process.env.WA_TTS_KEY });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({message: 'Error processing request token!'});
  });
});

app.get('/api/synthesize', (req, res) => {
  textToSpeech.synthesize(req.query).then(({ result }) => {
    result.pipe(res);
  }).catch(err => {
    console.log(err);
    res.status(500).json({message: 'Error processing request.'})
  })
});

app.post('/api/assistant', async (req, res) => {
  let { sessionId, message } = req.body;

  if (!sessionId) {
    try {
      const { result } = await assistant.createSession({assistantId: process.env.WA_ID, 
                                                        apikey: process.env.WA_KEY});
      sessionId = result.session_id;
    } catch (err) {
      console.log(err);
    }
  }

  if (sessionId) {
    const param = {
      input: { text: message || '' },
      assistantId: process.env.WA_ID || "",
      sessionId: sessionId,
      context: {
        global: {
          system: {
            timezone: 'America/Sao_Paulo'
          }
        }
      }
    };
 
    assistant.message(param).then(({ result }) => {
      res.json({sessionId: result.user_id, response: result.output.generic[0].text});
    }).catch(error => {
      const { status, message } = error;
      console.log(error);
      res.status( status || 500).send(message || 'Could not send message to assistant!');
    });
  } else {
    res.status(500).send('Error retrieving session id.');
  }
});

app.use(fallback('index.html', { root }));

// Handle 404 after handling everything else!
app.use(function (req, res) {
  console.log('404 - Error handler: ' + req.headers.host + req.url);

  res.status(404).send({
    message: 'Resource Not Found.',
    type: 'internal'
  });
});

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});