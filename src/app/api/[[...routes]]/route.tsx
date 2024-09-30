/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput, parseEther } from 'frog';
import { devtools } from 'frog/dev';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next';
import { serveStatic } from 'frog/serve-static';
import { env } from 'process';
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';
import { wagmiAbi } from '../../abi/wagmiAbi';
import { metaDataAbi } from '../../abi/metaDataAbi';
import axios from 'axios';

// Airstack API Token
export interface Env {
  AIRSTACK_API_TOKEN: string;
}

// contract variables
let tokenURI: string;
const reservePrice = formatEther(parseEther('.05'));

let auction: readonly [
  bigint,
  bigint,
  `0x${string}`,
  number,
  number,
  boolean
];

const client = createPublicClient({
  chain: base,
  transport: http(),
});

let bid: string;
let bidRaw: bigint;
let token: string;
let minBidIncrementBigInt: bigint;
let minBid: number;

const app = new Frog({
  hub: {
    apiUrl: 'https://hubs.airstack.xyz',
    fetchOptions: {
      headers: {
        'x-airstack-hubs': env.AIRSTACK_API_TOKEN ?? '',
        'cache-control': 'max-age=0',
      },
    },
  },
  verify: 'silent',
  title: 'Purple Frames',
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

export const runtime = 'edge';

app.frame('/', async (c) => {
  try {
    // Return auction from Purple DAO
    auction = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'auction',
    });
  } catch {}

  try {
    minBidIncrementBigInt = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'minBidIncrement',
    });
  } catch {}

  token = auction[0].toString();

  // Return tokenURI from Purple DAO
  try {
    tokenURI = await client.readContract({
      address: '0x36B5fb1D96052abee2758d625dC000D6d7f21B3c',
      abi: metaDataAbi,
      functionName: 'tokenURI',
      args: [BigInt(token)],
    });
  } catch {
    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: 'purple',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 60,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              marginTop: 30,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
            }}
          >
            Error, refresh frame
          </div>
        </div>
      ),
      // Resets the frame back to the initial/start URL.
      intents: [<Button.Reset>Reset</Button.Reset>],
    });
  }

  const purpleDaoToken = (await axios.get(tokenURI)).data;

  return c.res({
    image: purpleDaoToken.image,
    intents: [
      <Button action={`/join`} value="apple">
        join purple dao
      </Button>,
    ],
  });
});

app.frame('/join', async (c) => {
  try {
    // Return auction from Purple DAO
    auction = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'auction',
    });
  } catch {}

  try {
    minBidIncrementBigInt = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'minBidIncrement',
    });
  } catch {}

  token = auction[0].toString();
  bidRaw = auction[1];
  bid = formatEther(auction[1]);

  if (bidRaw === BigInt(0)) {
    minBid = Number(reservePrice);
  } else {
    minBid =
      Number(bid) / Number(minBidIncrementBigInt) + Number(bid);
  }

  // if auction is active show bid frame, else show

  if (Date.now() > auction[4] * 1000) {
    return c.res({
      image: (
        <div
          style={{
            alignItems: 'center',
            background: 'purple',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 60,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              marginTop: 30,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
            }}
          >
            There are no active auctions, start the next one
          </div>
        </div>
      ),
      intents: [
        <Button.Transaction target={`/startAuction`}>
          Start next auction
        </Button.Transaction>,
        <Button.Link href="https://warpcast.com/~/compose?embeds%5B%5D=https%3A%2F%2Fpurple-frames.pages.dev%2Fapi&text=start+the+next+purple+dao+auction+and+get+purple+pilled+-+frame+by+%40beachmfer.eth">
          Share
        </Button.Link>,
      ],
    });
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'purple',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`Current bid: ${bid}`}
        </div>
      </div>
    ),
    intents: [
      // <TextInput placeholder={`minimum bid ${minBid.toString()}`} />,
      <Button.Transaction target={`/mint`}>
        Bid {minBid.toString()}
      </Button.Transaction>,
      <Button.Link href="https://nouns.build/dao/base/0x8de71d80ee2c4700bc9d4f8031a2504ca93f7088?referral=0x83f2af0F0aC4412F118B31f7dd596309B25b34Dd">
        Auction
      </Button.Link>,
      <Button.Link href="https://warpcast.com/~/compose?embeds%5B%5D=https%3A%2F%2Fpurple-frames.pages.dev%2Fapi&text=Get+Purple+pilled!+Start+or+bid+on+Purple+Dao+auctions+from+the+feed+-+frame+by+%40beachmfer.eth">
        Share
      </Button.Link>,
    ],
  });
});

app.transaction('/startAuction', async (c) => {
  // Contract transaction response.
  const balance = await client.getBalance({
    address: c.address as `0x${string}`,
  });

  if (BigInt(balance) < BigInt(parseEther(minBid.toString()))) {
    return c.error({
      message: 'Insufficient balance',
    });
  }

  try {
    return c.contract({
      abi: wagmiAbi,
      chainId: 'eip155:8453',
      // chainId: 'eip155:84532',
      functionName: 'settleCurrentAndCreateNewAuction',
      args: [],
      // to: '0x03855976fcb91bf23110e2c425dcfb1ba0635b79',
      to: '0x73Ab6d816FB9FE1714E477C5a70D94E803b56576',
    });
  } catch {
    return c.error({
      message: 'Transaction failed',
    });
  }
});

app.transaction('/mint', async (c) => {
  try {
    // Return auction from Purple DAO
    auction = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'auction',
    });
  } catch {
    return c.error({
      message: 'Could not read contract',
    });
  }

  try {
    minBidIncrementBigInt = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'minBidIncrement',
    });
  } catch {
    return c.error({
      message: 'Could not read contract',
    });
  }

  token = auction[0].toString();
  bidRaw = auction[1];
  bid = formatEther(auction[1]);

  minBid = Number(bid) / Number(minBidIncrementBigInt) + Number(bid);

  let address = c.address;
  // Contract transaction response
  const balance = await client.getBalance({
    address: c.address as `0x${string}`,
  });

  if (BigInt(balance) < BigInt(parseEther(minBid.toString()))) {
    return c.error({
      message: 'Insufficient balance',
    });
  }

  try {
    return c.contract({
      abi: wagmiAbi,
      chainId: 'eip155:8453',
      // chainId: 'eip155:84532',
      functionName: 'createBidWithReferral',
      value: BigInt(parseEther(minBid.toString())),
      args: [
        BigInt(token),
        '0x83f2af0f0ac4412f118b31f7dd596309b25b34dd',
      ],
      // to: '0x03855976fcb91bf23110e2c425dcfb1ba0635b79',
      to: '0x73Ab6d816FB9FE1714E477C5a70D94E803b56576',
    });
  } catch {
    return c.error({
      message: 'Could not create bid',
    });
  }
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
