import Products from "~/components/pages/PageProducts/components/Products";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";
import axios from "axios";

const config = {
  oauthBaseUrl:
    "https://react-shop.auth.eu-west-1.amazoncognito.com/oauth2/token",
  grantType: "authorization_code",
  clientId: import.meta.env.VITE_CLIENT_ID,
  redirectUrl: import.meta.env.DEV
    ? "http://localhost:3000/"
    : import.meta.env.VITE_DEPLOYMENT_URL,
  token: import.meta.env.VITE_COGNITO_CLIENT_TOKEN,
};

export default function PageProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [token, setToken] = useState("");
  const [inFlight, setInFlight] = useState(false);

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || token || inFlight) return;

    const getToken = async () => {
      setInFlight(true);

      try {
        const response = await axios.post(
          config.oauthBaseUrl,
          `grant_type=${config.grantType}&code=${code}&client_id=${config.clientId}&redirect_uri=${config.redirectUrl}`,
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              Accept: "*",
              Authorization: `Basic ${config.token}`,
            },
          }
        );
        localStorage.setItem(
          "bearer_authorization_token",
          response.data.id_token
        );
        setToken(response.data.id_token);
        console.log("Cognito token was saved");

        searchParams.delete("code");
        setSearchParams(searchParams);
        setInFlight(false);
      } catch (e) {
        console.log("Error getting id token", e);
      }
    };

    getToken();
  }, [code]);

  return <Box py={3}>{!inFlight ? <Products /> : null}</Box>;
}
