export const getLatestAccountBalance = (crypto: string): string => `
  subscription AccountBalance($address: String!) @${crypto} {
    account(where: {address: {_eq: $address}}) {
      address
      available: account_balances(limit: 1, order_by: {height: desc}) {
        coins
        height
        tokens_prices {
          unit_name
          price
          timestamp
          token_unit {
            denom
            exponent
            token {
              token_units {
                denom
                exponent
              }
            }
          }
        }
      }
      delegated: delegations_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
        nodes {
          amount
          validator {
            validator_info {
              operator_address
            }
          }
          validator_address
        }
      }
      unbonding: unbonding_delegations_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
        nodes {
          amount
          completion_timestamp
          height
          validator {
            validator_info {
              operator_address
            }
          }
          validator_address
        }
      }
      rewards: delegation_rewards_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
        nodes {
          amount
          validator {
            validator_info {
              operator_address
            }
          }
          validator_address
        }
      }
      validator: validator_infos(where: {self_delegate_address: {_eq: $address}}) {
        consensus_address
        operator_address
        self_delegate_address
        validator {
          commissions: validator_commission_amounts_aggregate(limit: 1, order_by: {height: desc}) {
            nodes {
              amount
            }
          }
        }
      }
    }
  }  
`

export const getBalanceAtHeight = (crypto: string): string => `
  query AccountBalance($address: String!, $height: bigint! ) @${crypto} {
    account(where: { address: { _eq: $address } }) {
      address
      available: account_balance_histories(limit: 1, order_by: { height: desc }, where: { height: { _lte: $height } }) {
        coins
        height
        block { timestamp }
        tokens_prices: token_prices_history {
          unit_name
          price
          timestamp
          token_unit {
            denom
            exponent
            token {
              token_units {
                denom
                exponent
              }
            }
          }
        }
      }
      delegated: delegation_histories_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}], where: { height: { _lte: $height } }) {
        nodes {
          amount
          validator_address
        }
      }
      unbonding: unbonding_delegation_histories_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}], where: { height: { _lte: $height } }) {
        nodes {
          amount
          completion_timestamp
          height
          validator_address
        }
      }
      rewards: delegation_reward_histories_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}], where: { height: { _lte: $height } }) {
        nodes {
          amount
          validator_address
        }
      }
      validator: validator_infos(where: {self_delegate_address: {_eq: $address}}) {
        consensus_address
        operator_address
        self_delegate_address
        validator {
          commissions: validator_commission_amount_histories_aggregate(limit: 1, order_by: {height: desc}, where: { height: { _lte: $height } }) {
            nodes {
              amount
            }
          }
        }
      }
    }
  }
`

export const getBalance = (crypto: string, availableBalanceOnly?: boolean): string => `
query AccountBalance($address: String!) @${crypto} {
  account(where: {address: {_eq: $address}}) {
    address
    available: account_balances(limit: 1, order_by: {height: desc}) {
      coins
      height
      tokens_prices {
        unit_name
        price
        timestamp
        token_unit {
          denom
          exponent
          token {
            token_units {
              denom
              exponent
            }
          }
        }
      }
    }
    ${
      availableBalanceOnly
        ? ''
        : `
    delegated: delegations_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
      nodes {
        amount
        validator {
          validator_info {
            operator_address
          }
          validator_descriptions {
            moniker
            avatar_url
            height
          }
        }
        validator_address
      }
    }
    unbonding: unbonding_delegations_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
      nodes {
        amount
        completion_timestamp
        height
        validator {
          validator_info {
            operator_address
          }
          validator_descriptions {
            moniker
            avatar_url
            height
          }
        }
        validator_address
      }
    }
    rewards: delegation_rewards_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
      nodes {
        amount
        validator {
          validator_info {
            operator_address
          }
          validator_descriptions {
            moniker
            avatar_url
            height
          }
        }
        validator_address
      }
    }
    validator: validator_infos(where: {self_delegate_address: {_eq: $address}}) {
      consensus_address
      operator_address
      self_delegate_address
      validator {
        commissions: validator_commission_amounts_aggregate(limit: 1, order_by: {height: desc}) {
          nodes {
            amount
          }
        }
      }
    }
    `
    }
  }
}  
`

export const getDelegatedBalance = (crypto: string): string => `
query AccountBalance($address: String!) @${crypto} {
  account(where: {address: {_eq: $address}}) {
    address
    available: account_balances(limit: 1, order_by: {height: desc}) {
      coins
      height
      tokens_prices {
        unit_name
        price
        timestamp
        token_unit {
          denom
          exponent
          token {
            token_units {
              denom
              exponent
            }
          }
        }
      }
    }
    delegated: delegations_aggregate(distinct_on: [validator_address], order_by: [{validator_address: desc}, {height: desc}]) {
      nodes {
        amount
        validator {
          validator_info {
            operator_address
          }
          validator_descriptions {
            moniker
            avatar_url
            height
          }
        }
        validator_address
      }
    }
  }
}  
`
