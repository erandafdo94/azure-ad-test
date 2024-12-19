export const msalConfig = {
  auth: {
    clientId: "9bc2a3d9-bd5f-4b5b-9c87-61e2e70cd624",
    authority:
      "https://login.microsoftonline.com/e6a8c8c3-6ec7-46f7-9f8f-d08b86070435",
    redirectUri: "http://localhost:5173", // Default Vite dev server port
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "email", "profile"],
};
