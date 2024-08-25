export const wagmiAbi = [
  {
    inputs: [],
    name: 'auction',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      {
        internalType: 'uint256',
        name: 'highestBid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'highestBidder',
        type: 'address',
      },
      { internalType: 'uint40', name: 'startTime', type: 'uint40' },
      { internalType: 'uint40', name: 'endTime', type: 'uint40' },
      { internalType: 'bool', name: 'settled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minBidIncrement',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
      { internalType: 'address', name: '_referral', type: 'address' },
    ],
    name: 'createBidWithReferral',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
