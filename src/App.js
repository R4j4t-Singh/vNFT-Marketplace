import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import "./App.css";
import Header from "./Header";
import { Types, AptosClient } from "aptos";
import { Buffer } from "buffer";
import VideoFormPopup from "./VideoFormPopup";

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

const auth =
  "Basic " +
  Buffer.from(
    process.env.REACT_APP_INFURA_PROJECT_ID +
      ":" +
      process.env.REACT_APP_INFURA_API_KEY
  ).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

function App() {
  const [videoBuffer, setVideoBuffer] = useState(null);
  const [videos, setVideos] = useState([]);
  const [address, setAddress] = useState(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const handleFormPopup = () => setShowFormPopup(true);
  const handleCloseFormPopup = () => setShowFormPopup(false);
  const[refresh,setRefresh] = useState(false);
  const [account, setAccount] = useState("");

  useEffect(() => {
    if (!address) return;
    client.getAccount(address).then(setAccount);
  }, [address]);

  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (!address) return;
    client.getAccountModules(address).then(setModules);
  }, [address]);

  useEffect(()=>{
    let ignore = false;
    if(!ignore) {
      fetch("http://localhost:5000/getVideos").then(res => res.json()).then(res => {
        console.log(res);
        setVideos(res);
      });
    }
    return () => { ignore = true; }
  },[refresh])

  async function ConnectToWallet() {
    const { address, publicKey } = await window.aptos.connect();
    setAddress(address);
    console.log(address);
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const buffer = await file.arrayBuffer();
    setVideoBuffer(buffer);
  };

  const handleUpload = async (videoDetails) => {
    if(address==null) {
      alert("Please connect to wallet");
      return;
    } 

    if (!videoBuffer) {
      alert("Please select a video file to upload.");
      return;
    }

    console.log("Uploading to Ipfs");
    console.log(videoDetails);

    const { cid } = await ipfs.add(videoBuffer);

    fetch("http://localhost:5000/UploadVideo", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cid : cid.toString(),
        title: videoDetails.title,
        description: videoDetails.description,
        tags: videoDetails.tags ,
        category: videoDetails.category,
        creater: address,
      }) 
    }).then(res => res.json()).then(res => console.log(res.success+res.message));

    setVideoBuffer(null);
    setRefresh(true);
  };

  const mint = async (cid) => {
    let title, description, tags, category,creater;

    await fetch(`http://localhost:5000/getVideo/${cid}`).then(res => res.json()).then(res => {
      console.log(res);
      title = res.title;
      description = res.description;
      tags = res.tags;
      category = res.category;
      creater = res.creater;
    });

    const transaction = {
      type: "entry_function_payload",
      function: `${process.env.REACT_APP_MODULE_OWNER}::NFT_test2::create_nft`,
      arguments: [cid, creater, title, description, tags, category],
      type_arguments: [],
    };
    
    await window.aptos.signAndSubmitTransaction(transaction);

    fetch("http://localhost:5000/saveMint", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid : cid,
          mint: address})
        }).then(res => res.json()).then(res => console.log(res.success+res.message));
        setRefresh(false);
  };

  return (
    <div>
      <Header></Header>
      <button
        className="connect-wallet-btn"
        onClick={ConnectToWallet}
      >
        Connect Wallet
      </button>

      <div
        style={{ margin: "8px 0", display: "flex", justifyContent: "flex-end" }}
      >
        <button
          onClick={handleFormPopup}
          className="upload-video-btn"
        >
          Upload Video
        </button>
        <VideoFormPopup
          show={showFormPopup}
          handleClose={handleCloseFormPopup}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
        />
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {videos.map((video) => (
          <li key={video.cid} style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <video width="320" height="240" controls>
                <source
                  src={`https://ipfs.io/ipfs/${video.cid}`}
                  type="video/mp4"
                />
              </video>
            </div>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
            <h3>{video.title}</h3>
            <p>{video.description}</p>
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
            {video.mint==""?<button
                className="mint-nft-btn"
                onClick={() => mint(video.cid)}
              >
                Mint NFT
              </button>
              :<button className="mint-nft-btn">Sold</button>
              }
              <a
                href={`https://ipfs.io/ipfs/${video.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-ipfs-btn"
              >
                View on IPFS
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
