import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

// const provider = new ethers.providers.Web3Provider(window.ethereum);

const url = process.env.REACT_APP_GOERLI_URL;
console.log("url: ", url);

// let artifacts = await hre.artifacts.readArtifact("Faucet");
const provider = new ethers.providers.JsonRpcProvider(url);

const privateKey = process.env.REACT_APP_PRIVATE_KEY;
const arbiterPK = process.env.REACT_APP_ARBITER_PK;

const wallet = new ethers.Wallet(privateKey, provider);
const arbiterWallet = new ethers.Wallet(arbiterPK, provider);


export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [signer, setSigner] = useState();
  const [arbiterSigner, setArbiterSigner] = useState();


  
  useEffect(() => {
    async function getSigner() {
      setSigner(wallet);
      setArbiterSigner(arbiterWallet);
    }

    getSigner();
  }, [signer, arbiterSigner]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.BigNumber.from(document.getElementById('wei').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, arbiterSigner);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Wei)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
