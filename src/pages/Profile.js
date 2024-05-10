import React, { useState, useEffect } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Row, Form, Button, Card, ListGroup, Col } from "react-bootstrap";

import { REACT_APP_PINATA_API_Secret, REACT_APP_PINATA_API_Key } from "../config"
import axios from "axios";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Profile = ({ contract }) => {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState();
  const [profile, setProfile] = useState();
  const [avatar, setAvatar] = useState();
  const [username, setUsername] = useState();

  const loadMyNFTs = async () => {
    const results = await contract.getMyNfts();

    let nfts = await Promise.all(
      results.map(async (i) => {
        const uri = await contract.tokenURI(i);

        const response = await fetch(uri);
        const metadata = await response.json();

        return {
          id: i,
          username: metadata.username,
          avatar: metadata.avatar,
        };
      })
    );

    setNfts(nfts);
    getProfile(nfts);
  };

  const getProfile = async (nfts) => {
    const address = await contract.signer.getAddress();
    const id = await contract.profiles(address);
    const profile = nfts.find((i) => i.id.toString() === id.toString());
    setProfile(profile);
    setLoading(false);
  };

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const data = new FormData();
        data.append("file", file);
        const result = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data,
          {
            maxContentLength: "Infinity",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
              pinata_api_key: REACT_APP_PINATA_API_Key,
              pinata_secret_api_key: REACT_APP_PINATA_API_Secret,
            },
          }
        );
        setAvatar(`https://green-obvious-damselfly-23.mypinata.cloud/ipfs/${result.data.IpfsHash}`);
      } catch (error) {
        console.log("ipfs image upload error", error);
      }
    }
  };

  const mintProfile = async (event) => {
    if (!avatar) return;
  
    try {
      const jsonData = JSON.stringify({ avatar, username });
  
      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        jsonData,
        {
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: REACT_APP_PINATA_API_Key,
            pinata_secret_api_key: REACT_APP_PINATA_API_Secret,
          },
        }
      );

      const ipfsUri = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;
  
      setLoading(true);
  
      await (await contract.mint(ipfsUri)).wait();
      loadMyNFTs();
    } catch (error) {
      console.log("IPFS URI upload error", error);
    }
  };

  const switchProfile = async (nft) => {
    setLoading(true);
    await (await contract.setProfile(nft.id)).wait();
    getProfile(nfts);
  };

  useEffect(() => {
    if (!nfts) {
      loadMyNFTs();
    }
  }, []);
  if (loading) return <div className="">Loading Profile</div>;

  return (
    <div>
      {profile ? (
        <div>
          <p>{profile.username}</p>
          <img src={profile.avatar} height={"400px"} width={"400px"} alt="" />
        </div>
      ) : (
        <h4>No NFTS Profile Please Create One</h4>
      )}

      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setUsername(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Username"
              />
              <div className="d-grid px-0">
                <Button onClick={mintProfile} variant="primary" size="lg">
                  Mint NFT Profile
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      <div className="px-5 container">
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
          {nfts.map((nft, idx) => {
            if (nft.id === profile.id) return;
            return (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={nft.avatar} />
                  <Card.Body color="secondary">
                    <Card.Title>{nft.username}</Card.Title>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => switchProfile(nft)}
                        variant="primary"
                        size="lg"
                      >
                        Set as Profile
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default Profile;
