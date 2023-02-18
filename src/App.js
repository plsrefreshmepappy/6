import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 300px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your COOL.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(160000);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    // Calculate the time remaining in the timer
    const endTime = new Date("2022-12-21T11:30:00Z");
    const timeRemaining = endTime - new Date();

    // Set the initial time remaining
    setTimeRemaining(timeRemaining);

    // Update the time remaining every second
    const interval = setInterval(() => {
      setTimeRemaining(timeRemaining - 1000);
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);


  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >




        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>








          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--primary)",
              padding: 24, //24
              borderRadius: 30, //24
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
              opacity: 0.65
            }}
          >

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              The Manity by Holo
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              The Manity by Holo brings the art of the human form to life in the digital world.
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Each unique Ethereum NFT captures a different aspect of humanity,
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >

              from our deepest emotions to our most complex thoughts.
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              The art allows us to explore these characteristics in a new and meaningful way,
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >

              transcending the boundaries of the physical world to uncover the true essence of what it means to be human.
            </s.TextDescription>
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 60,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              MINT OPEN
            </s.TextDescription>



            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 50)}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >

            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {CONFIG.SYMBOL} mint price: {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />

                <s.SpacerSmall />
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      Wallet connect
                    </StyledButton>

                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}

                    {/* <StyledButton
                      style={{
                        margin: "5px",
                      }}
                      onClick={(e) => {
                        window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                      }}
                    >
                      {CONFIG.MARKETPLACE}
                    </StyledButton> */}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Choose Mint Amount:
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          fontSize: 30,
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>

                      <s.SpacerMedium />



                    </s.Container>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.TextDescription
                      style={{
                        fontSize: 30,
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {(mintAmount * CONFIG.DISPLAY_COST).toFixed(3)} ETH
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>



                    </s.Container>

                    <StyledButton
                      style={{
                        margin: "5px",
                      }}
                      onClick={(e) => {
                        window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                      }}
                    >
                      {CONFIG.MARKETPLACE}
                    </StyledButton>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />




            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              The rarity of each Manity NFT is determined not only by the artist's unique design, but also by the actions of its individual owners.
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >


              For example, by holding and collecting multiple Manity NFTs, your NFTs will reflect a sense of joy and hope.
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              This unique feature creates a truly interactive experience,
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              where the actions of each individual owner have a direct impact on the emotional state of their Manity NFT.
            </s.TextDescription>
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 16,
                //fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Stay tuned for more instructions on reveal mechanics and how to shape your Manity.
            </s.TextDescription>
          </s.Container>
          <s.SpacerLarge />
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>

          <s.SpacerSmall />

        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
