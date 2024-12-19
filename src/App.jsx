// src/App.jsx
import { useState, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./config/authConfig";
import axios from "axios";
import "./App.css";

function App() {
  const [msalInstance, setMsalInstance] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();

        // Check if there's a cached account
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setUserInfo(accounts[0]);
        }

        setMsalInstance(msalInstance);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMsal();
  }, []);

  const handleLogin = async () => {
    try {
      if (!msalInstance) throw new Error("MSAL not initialized");

      const response = await msalInstance.loginPopup(loginRequest);

      console.log("MSAL Response:", response);

      // Acquire token silently after login
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: response.account,
      });

      // Send token to your backend
      const result = await axios.post(
        "https://localhost:7289/auth/azure-authenticate",
        {
          accessToken: tokenResponse.accessToken,
        },
        {
          withCredentials: true,
        }
      );

      if (result.data) {
        setUserInfo(response.account);
        setError(null);
      }
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        // Fallback to interactive method
        const tokenResponse = await msalInstance.acquireTokenPopup(
          loginRequest
        );
        // ... rest of the code
      }
      setError(err.message);
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      if (!msalInstance) throw new Error("MSAL not initialized");

      // Call your backend logout endpoint
      if (userInfo) {
        await axios.post(
          "http://localhost:YOUR_BACKEND_PORT/api/auth/revoke-token",
          {
            accountId: userInfo.localAccountId,
          },
          {
            withCredentials: true,
          }
        );
      }

      // Logout from Azure AD
      await msalInstance.logoutPopup();
      setUserInfo(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Azure AD Auth Test</h1>

      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>Error: {error}</div>
      )}

      {!userInfo ? (
        <button onClick={handleLogin} disabled={!msalInstance}>
          Login with Azure AD
        </button>
      ) : (
        <div>
          <p>Welcome, {userInfo.name}!</p>
          <p>Email: {userInfo.username}</p>
          <button onClick={handleLogout} disabled={!msalInstance}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
