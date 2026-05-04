import React from "react";
import Button from "../../components/Button.tsx";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../components/AppLogo.tsx";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <div className="landingMain">
        <div className="appLogo">
          <AppLogo />
        </div>
        <h1>Get Smarter with Health Check</h1>
        <h2>Try our Web Billing Demo Subscription Flow Today.</h2>
        <Button caption="Subscribe now" onClick={() => navigate("/login")} />
      </div>
      <div className="screenshot">
        <img src="/screenshot.png" alt="Screenshot of the app" />
      </div>
    </div>
  );
};

export default LandingPage;
