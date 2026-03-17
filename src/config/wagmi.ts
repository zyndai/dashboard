import { http, createConfig, injected } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "Zynd Protocol",
        url: "https://zynd.ai",
        iconUrl: "https://wagmi.io/favicon.ico",
      },
    }),
  ],
  transports: {
    [polygonAmoy.id]: http(),
  },
});
