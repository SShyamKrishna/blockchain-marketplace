import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("Marketplace", async function () {
  it("should list an item", async function () {
    const { ethers } = await hre.network.connect();

    const marketplace: any = await ethers.deployContract("Marketplace");
    await marketplace.waitForDeployment();

    await marketplace.listItem("Laptop", ethers.parseEther("1"));

    const item = await marketplace.items(1);

    assert.equal(item.id.toString(), "1");
    assert.equal(item.name, "Laptop");
    assert.equal(item.sold, false);
  });

  it("should allow a user to buy an item", async function () {
    const { ethers } = await hre.network.connect();

    const [seller, buyer] = await ethers.getSigners();

    const marketplace: any = await ethers.deployContract("Marketplace");
    await marketplace.waitForDeployment();

    await marketplace.connect(seller).listItem("Phone", ethers.parseEther("1"));

    await marketplace.connect(buyer).buyItem(1, {
      value: ethers.parseEther("1"),
    });

    const item = await marketplace.items(1);

    assert.equal(item.sold, true);
    assert.equal(item.owner, buyer.address);
  });
});