import { useState } from "react";
import "./App.css";
import { Header } from "./Header/Header.jsx";
import { useAccount } from "./hooks/useAccount.js";
import { AccountState } from "./Account/AccountState.jsx";
import { VenearState } from "./Venear/VenearState.jsx";
import { VotingState } from "./Voting/VotingState.jsx";
import { CreateProposal } from "./Voting/CreateProposal.jsx";

function App() {
  const accountId = useAccount();

  return (
    <div className="container-fluid">
      <Header accountId={accountId} />
      <div className="container">
        {accountId ? (
          <AccountState key="account" />
        ) : (
          <div className="alert alert-warning" role="alert">
            Sign
          </div>
        )}
        <VenearState />
        <VotingState />
        {accountId && <CreateProposal key="create-proposal" />}
      </div>
    </div>
  );
}

export default App;
