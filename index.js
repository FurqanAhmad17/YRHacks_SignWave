const express = require("express");
const cors = require("cors");
const TeachableMachine = require("@sashido/teachablemachine-node");
const bodyParser = require("body-parser");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/cOP_JmwgK/",
});

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(bodyParser.json());
const port = process.env.port || 5200;

app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send(`
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .header {
        text-align: center;
        padding: 20px 0;
      }
  
      .header img {
        max-width: 100%;
        height: auto;
      }

    .container {
      text-align: center;
    }

    input {
      padding: 10px;
      margin-bottom: 10px;
      width: 300px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }

    button {
      padding: 10px 20px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }

    #server_response {
      margin-top: 20px;
      font-size: 20px;
      font-weight: bold;
    }
  </style>

  <body>

   <div class="header">
   <img src="https://i.pinimg.com/736x/e8/8b/df/e88bdf7d6bbaba2ae7a4b2a6c4dd973c.jpg" alt="Site Title">
   </div>

  <div class="container">
    <p>Enter Image URL</p>
    <input id="imageUrlInput" autocomplete="off">
    <button onClick="fetchData()">Predict Image</button>
    <div id="server_response">No Word Detected</div>
    <audio controls id="audioPlayer"></audio>
  </div>

  <script>
    async function fetchData() {
      const url = document.getElementById("imageUrlInput").value;
      const response = await fetch("/image/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ImageUrl: url })
      });
      const responseData = await response.json();
      let response_class = responseData[0].class;
      document.getElementById("server_response").textContent = response_class;

      var myHeaders = new Headers();
   myHeaders.append("Content-Type", "application/json");
   myHeaders.append("Cache-Control", "no-cache");
   myHeaders.append("Accept", "*/*");
   myHeaders.append("Accept-Encoding", "gzip,deflate");
   myHeaders.append("Connection", "keep-alive");
   myHeaders.append("X-RapidAPI-Key", "ADD PERSONAL API KEY HERE");
   myHeaders.append("X-RapidAPI-Host", "realistic-text-to-speech.p.rapidapi.com");


   var raw = JSON.stringify({
   "voice_obj": {
       "id": 2014,
       "voice_id": "en-US-Neural2-A",
       "gender": "Male",
       "language_code": "en-US",
       "language_name": "US English",
       "voice_name": "John",
       "sample_text": "Hello, hope you are having a great time making your video.",
       "sample_audio_url": "https://s3.ap-south-1.amazonaws.com/invideo-uploads-ap-south-1/speechen-US-Neural2-A16831901130600.mp3",
       "status": 2,
       "rank": 0,
       "type": "google_tts",
       "isPlaying": false
   },
   "json_data": [
       {
       "block_index": 0,
       "text": response_class
       }
   ]
   });


   var requestOptions = {
   method: 'POST',
   headers: myHeaders,
   body: raw,
   redirect: 'follow'
   };


   fetch("https://realistic-text-to-speech.p.rapidapi.com/v3/generate_voice_over_v2", requestOptions)
   .then(response => response.text())
   .then(result => {
    console.log(result);
    
    const audioLink = JSON.parse(result)[0]["link"];
    
    if (audioLink) {
      const audioPlayer = document.getElementById("audioPlayer");
      audioPlayer.src = audioLink;
      audioPlayer.play();
    }
    
   })
   .catch(error => console.log('error', error));

    }
  </script>
  ,</body>
  `);
});

app.post("/image/classify", async (req, res) => {
  const url = req.body.ImageUrl;

  return model
    .classify({
      imageUrl: url,
    })
    .then((predictions) => {
      res.json(predictions);
    })
    .catch((e) => {
      res.status(500).send("Something went wrong!");
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
