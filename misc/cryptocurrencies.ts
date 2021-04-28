const cryptocurrencies = {
  // ATOM: { name: 'ATOM', image: '/static/images/cryptocurrencies/atom.png', coinType: 118 },
  DSM: {
    name: 'DSM',
    ecosystem: 'cosmos',
    image: '/static/images/cryptocurrencies/dsm.png',
    coinType: 852,
    graphqlHttpUrl: 'https://gql.morpheus.desmos.network/v1/graphql',
    graphqlWsUrl: 'wss://gql.morpheus.desmos.network/v1/graphql',
    defaultGasFee: {
      amount: [
        {
          amount: '10000',
          denom: 'udaric',
        },
      ],
      gas: '200000',
    },
  },
  // SOL: { name: 'SOL', image: '/static/images/cryptocurrencies/sol.png', coinType: 501 },
}

export default cryptocurrencies
