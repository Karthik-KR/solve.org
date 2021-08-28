import { useState } from "react";
import { ethers } from "ethers";
import { requestAccount } from "../utils";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@material-ui/core";
import { useStyles } from "../styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import CircularProgressWithLabel from "../styles/circularWithLabel";
import { Button } from "@material-ui/core";
import VotingContract from "../abis/VotingContract.json";
const constants = require("../abis/contract-address.json");

function GetIdeas() {
  const classes = useStyles();

  const [ideas, setIdeas] = useState(() => new Map());
  const [status, setStatus] = useState();

  const showIdeaCards = (allIdeas) => {
    return allIdeas.map((idea) => {
      return (
        <Card className={classes.root} variant="outlined">
          <CardContent>
            <Typography color="secondary" variant="h5" component="h2">
              Idea Title
            </Typography>
            <Typography className={classes.pos}>
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived
            </Typography>
            <Typography color="secondary" variant="h5" component="h2">
              Solution
            </Typography>
            <Typography className={classes.pos}>
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived is
              simply dummy text of the printing and typesetting industry. Lorem
            </Typography>
          </CardContent>
          <div className={classes.infoBar}>
            <IconButton color="secondary" aria-label="vote">
              &nbsp; <ThumbUpIcon /> &nbsp; 25
            </IconButton>
            <IconButton aria-label="voteStatus">
              <CircularProgressWithLabel
                thickness="5"
                variant="static"
                color="secondary"
                value={80}
              />
            </IconButton>
            {/* <IconButton color="secondary" aria-label="claim">
              Claim &nbsp; <MonetizationOnIcon />
            </IconButton> */}
          </div>
        </Card>
      );
    });
  };

  async function getIdeas() {
    setStatus("Loading...");
    if (typeof window.ethereum != undefined) {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const getIdeasContract = new ethers.Contract(
        constants.VotingContract,
        VotingContract.abi,
        signer
      );

      try {
        let totalIdeas = Number(await getIdeasContract.getTotalIdeas());

        for (var i = 1; i <= totalIdeas; i++) {
          let ideaFromContract = await getIdeasContract.ideas(i);
          setIdeas(ideas.set(i, ideaFromContract));
        }
      } catch (err) {
        console.log(err);
        setStatus("idea fetching failed");
      }
    }
  }

  return (
    <Container fixed>
      <Grid container>{showIdeaCards([1, 2, 3, 4])}</Grid>
    </Container>
  );

  async function voteForIdea(ideaId) {
    setStatus("Loading...");

    if (typeof window.ethereum != undefined) {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const votingContract = new ethers.Contract(
        constants.VotingContract,
        VotingContract.abi,
        signer
      );

      try {
        let submitVoteTransaction = await votingContract.voteForIdea(ideaId);

        let receipt = await submitVoteTransaction.wait();
        console.log(receipt);

        let ideaFromContract = await votingContract.ideas(ideaId);
        setIdeas(ideas.set(ideaId, ideaFromContract));

        setStatus(`Idea Voted successfully`);
      } catch (err) {
        console.log(err);
        setStatus("Failed to vote for idea");
      }
    }
  }

  async function claimFunds(ideaId) {
    setStatus("Loading...");

    if (typeof window.ethereum != undefined) {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const votingContract = new ethers.Contract(
        constants.VotingContract,
        VotingContract.abi,
        signer
      );

      try {
        let submitClaimTransaction = await votingContract.claimFunds(ideaId);

        let receipt = await submitClaimTransaction.wait();
        console.log(receipt);

        let ideaFromContract = await votingContract.ideas(ideaId);
        setIdeas(ideas.set(ideaId, ideaFromContract));

        setStatus(`Idea funds claimed successfully`);
      } catch (err) {
        console.log(err);
        setStatus("Failed to claim funds for idea");
      }
    }
  }
}

export { GetIdeas };
