import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { wagmiAbi } from '../../abi/wagmiAbi';
import { metaDataAbi } from '@/app/abi/metaDataAbi';
import axios from 'axios';
import style from 'styled-jsx/style';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'edge';

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

let token: string;
let tokenURI: string;



export async function GET(request: NextRequest) {
  try {
    // Return auction from Purple DAO
    auction = await client.readContract({
      address: '0x73ab6d816fb9fe1714e477c5a70d94e803b56576',
      abi: wagmiAbi,
      functionName: 'auction',
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

  }

  const purpleDaoToken = (await axios.get(tokenURI)).data;

  const imageURL = await purpleDaoToken.image

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // responseText += suffix

  return new Response(imageURL);
}
