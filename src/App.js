import { useState } from "react";
import { ethers } from "ethers";
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import DecentralizedSocialAppAddress from "./contractsData/decentralizedSocialApp-address.json";
import DecentralizedSocialAppAbi from "./contractsData/decentralizedSocialApp.json";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [loading, setloading] = useState(true);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState({});

  const web3Handler = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      setloading(true);
      web3Handler();
    });

    // Get Provider from MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Get Signer
    const signer = provider.getSigner();
    loadContract(signer);
  };

  const loadContract = async (signer) => {
    // Get Deployed Copy of Decentralized Social App Contract
    const contract = new ethers.Contract(
      DecentralizedSocialAppAddress.address,
      DecentralizedSocialAppAbi.abi,
      signer
    );
    setContract(contract);
    setloading(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-200">
        <div className="bg-red-400 p-[10px] flex justify-between text-white">
          Hello
          <button
            className="border-white border-[2px] rounded-md p-[5px] cursor-pointer hover:text-black hover:border-black transition-all"
            onClick={web3Handler}
          >
            {loading ? "Connect MetaMask" : account}
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          
          <Routes>
            <Route
              path="/"
              element={<Home contract={contract} account={account} />}
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
