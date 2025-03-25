import { useState } from "react";
import "./App.css";
import { Header } from "./Header/Header.jsx";
import { useAccount } from "./hooks/useAccount.js";
import { AccountState } from "./Account/AccountState.jsx";
import { VenearState } from "./Venear/VenearState.jsx";
import { VotingState } from "./Voting/VotingState.jsx";

function App() {
  const accountId = useAccount();

  return (
    <div className="container-fluid">
      <Header />
      <div className="container">
        {accountId ? (
          <AccountState />
        ) : (
          <div className="alert alert-warning" role="alert">
            Sign
          </div>
        )}
        <VenearState />
        <VotingState />
      </div>
    </div>
  );
}

export default App;
