import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  "function listItem(string memory _name, uint256 _price) public",
  "function buyItem(uint256 _id) public payable",
  "function itemCount() public view returns (uint256)",
  "function items(uint256) public view returns (uint256 id, string memory name, uint256 price, address seller, address owner, bool sold)"
];

function App() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [listedItem, setListedItem] = useState(null);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner();

      setAccount(accounts[0]);
      setStatus("Wallet connected");
    } catch (error) {
      console.error(error);
      setStatus("Connection failed");
    }
  }

  async function listItem() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      if (!itemName || !itemPrice) {
        setStatus("Enter item name and price");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const priceInWei = ethers.parseEther(itemPrice);

      setStatus("Listing item...");

      const tx = await contract.listItem(itemName, priceInWei);
      await tx.wait();

      setStatus("Item listed successfully");
      setItemName("");
      setItemPrice("");
    } catch (error) {
      console.error(error);
      setStatus("Listing failed");
    }
  }

  async function fetchLatestItem() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.itemCount();

      if (count == 0) {
        setStatus("No items found");
        return;
      }

      const item = await contract.items(count);

      setListedItem({
        id: item.id.toString(),
        name: item.name,
        price: ethers.formatEther(item.price),
        seller: item.seller,
        owner: item.owner,
        sold: item.sold,
      });

      setStatus("Latest item loaded");
    } catch (error) {
      console.error(error);
      setStatus("Failed to fetch item");
    }
  }

  async function buyLatestItem() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      if (!listedItem) {
        setStatus("Load an item first");
        return;
      }

      if (listedItem.sold) {
        setStatus("Item already sold");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setStatus("Buying item...");

      const tx = await contract.buyItem(listedItem.id, {
        value: ethers.parseEther(listedItem.price),
      });

      await tx.wait();

      setStatus("Item purchased successfully");
      await fetchLatestItem();
    } catch (error) {
      console.error(error);
      setStatus("Purchase failed");
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Blockchain Marketplace</h1>
      <p>Contract Address: {CONTRACT_ADDRESS}</p>

      <button onClick={connectWallet}>Connect MetaMask</button>

      <p>Status: {status}</p>
      <p>Account: {account || "Not connected"}</p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>List an Item</h2>

      <input
        type="text"
        placeholder="Item name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <input
        type="text"
        placeholder="Price in ETH"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "300px" }}
      />

      <button onClick={listItem}>List Item</button>

      <hr style={{ margin: "2rem 0" }} />

      <h2>View Latest Item</h2>
      <button onClick={fetchLatestItem}>Load Latest Item</button>

      {listedItem && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", width: "500px" }}>
          <p><strong>ID:</strong> {listedItem.id}</p>
          <p><strong>Name:</strong> {listedItem.name}</p>
          <p><strong>Price:</strong> {listedItem.price} ETH</p>
          <p><strong>Seller:</strong> {listedItem.seller}</p>
          <p><strong>Owner:</strong> {listedItem.owner}</p>
          <p><strong>Sold:</strong> {listedItem.sold ? "Yes" : "No"}</p>

          {!listedItem.sold && (
            <button onClick={buyLatestItem} style={{ marginTop: "1rem" }}>
              Buy Latest Item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;