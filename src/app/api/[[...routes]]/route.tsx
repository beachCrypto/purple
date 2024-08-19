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
import { wagmiAbi } from '../../../abi/wagmiAbi';

// Airstack API Token
export interface Env {
  AIRSTACK_API_TOKEN: string;
}

// contract variables

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
  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
  // 2. Set up your client with desired chain & transport.

  // 3. Consume an action!
  const blockNumber = await client.getBlockNumber();
  console.log('blockNumber', blockNumber);

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
          Purple
        </div>
      </div>
    ),
    intents: [
      <Button action={`/more`} value="apple">
        learn about purple dao
      </Button>,
    ],
  });
});

app.frame('/more', async (c) => {
  // Return auction from Purple DAO
  auction = await client.readContract({
    address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
    abi: wagmiAbi,
    functionName: 'auction',
  });

  token = auction[0].toString();
  bidRaw = auction[1];
  bid = formatEther(auction[1]);

  console.log('auction', auction);
  console.log('token id', token);
  console.log('bid', bid);

  minBidIncrementBigInt = await client.readContract({
    address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
    abi: wagmiAbi,
    functionName: 'minBidIncrement',
  });

  console.log('minBidIncrementBigInt', minBidIncrementBigInt);

  minBid = Number(bid) / Number(minBidIncrementBigInt) + Number(bid);

  console.log('minBid', minBid);

  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
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
          Purple’s goal is to proliferate and expand the Farcaster
          protocol and ecosystem.
        </div>
      </div>
    ),
    intents: [
      <Button action={`/join`}>Join</Button>,
      <Button.Link href="https://warpcast.com/~/compose?embeds%5B%5D=https%3A%2F%2Fpurple-frames.pages.dev%2Fapi&text=get+purple+pilled+-+frame+by+%40pichi+and+%40beachcrypto">
        Share
      </Button.Link>,
      <Button.Link href="https://nouns.build/dao/base/0x8de71d80ee2c4700bc9d4f8031a2504ca93f7088?referral=0x83f2af0F0aC4412F118B31f7dd596309B25b34Dd">
        Auction
      </Button.Link>,
    ],
  });
});

app.frame('/join', (c) => {
  console.log('bid from join', bid);
  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
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
      <TextInput placeholder={`minimum bid ${minBid.toString()}`} />,
      <Button.Transaction target={`/mint`}>
        Place bid
      </Button.Transaction>,
      <Button action={`/`}>Back</Button>,
    ],
  });
});

let auctionABI = require('../../../abi/abi.json');

// console.log('abi', auctionABI);

app.transaction('/mint', (c) => {
  // Contract transaction response.
  return c.contract({
    abi: auctionABI,
    chainId: 'eip155:8453',
    // chainId: 'eip155:84532',
    functionName: 'createBidWithReferral',
    value: bidRaw,
    args: [token, '0x83f2af0f0ac4412f118b31f7dd596309b25b34dd'],
    // to: '0x03855976fcb91bf23110e2c425dcfb1ba0635b79',
    to: '0x73Ab6d816FB9FE1714E477C5a70D94E803b56576',
  });
});

// referral - 0x83f2af0F0aC4412F118B31f7dd596309B25b34Dd

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
