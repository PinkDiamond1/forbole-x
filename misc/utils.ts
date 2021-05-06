import get from 'lodash/get'
import last from 'lodash/last'
import cloneDeep from 'lodash/cloneDeep'
import drop from 'lodash/drop'
import keyBy from 'lodash/keyBy'
import format from 'date-fns/format'

export const formatPercentage = (percent: number, lang: string): string =>
  new Intl.NumberFormat(lang, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent || 0)

export const formatCrypto = (
  amount: number,
  unit: string,
  lang: string,
  hideUnit?: boolean
): string =>
  `${new Intl.NumberFormat(lang, {
    signDisplay: 'never',
    maximumFractionDigits: 4,
  }).format(amount || 0)}${hideUnit ? '' : ` ${(unit || '').toUpperCase()}`}`

export const formatCurrency = (
  amount: number,
  currency: string,
  lang: string,
  hideUnit?: boolean,
  compact?: boolean
): string =>
  `${new Intl.NumberFormat(lang, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : undefined,
  }).format(amount || 0)}${hideUnit ? '' : ` ${currency}`}`

export const getTokenAmountFromDenoms = (
  coins: Array<{ denom: string; amount: string }>,
  denoms: TokenPrice[]
): TokenAmount => {
  const result = {}
  coins.forEach((coin) => {
    denoms.some((d) => {
      const unit = get(d, 'token_unit.token.token_units', []).find(
        (t) => t && coin && t.denom === coin.denom
      )
      if (unit) {
        const base = get(d, 'token_unit.token.token_units', []).find((t) => t.denom === d.unit_name)
        if (result[base.denom]) {
          result[base.denom].amount += Number(coin.amount) * 10 ** (unit.exponent - base.exponent)
        } else {
          result[base.denom] = {
            amount: Number(coin.amount) * 10 ** (unit.exponent - base.exponent),
            price: d.price,
          }
        }
        return true
      }
      return false
    })
  })
  return result
}

export const formatTokenAmount = (
  tokenAmount: TokenAmount,
  defaultUnit: string,
  lang: string,
  delimiter?: string
): string =>
  tokenAmount && Object.keys(tokenAmount).length
    ? Object.keys(tokenAmount)
        .map((ta) => formatCrypto(tokenAmount[ta].amount, ta.toUpperCase(), lang))
        .join(delimiter || '\n')
    : formatCrypto(0, defaultUnit, lang)

export const getTotalTokenAmount = (
  accountBalance?: AccountBalance
): { amount: TokenAmount; timestamp: number } => {
  if (!accountBalance) {
    return {
      amount: {},
      timestamp: 0,
    }
  }
  const amount = {}
  const { balance, timestamp } = accountBalance
  Object.values(balance).forEach((ba) => {
    Object.keys(ba).forEach((t) => {
      if (!amount[t]) {
        amount[t] = { amount: 0, price: 0 }
      }
      amount[t].amount = (amount[t].amount || 0) + ba[t].amount
      amount[t].price = ba[t].price
    })
  })
  return {
    amount,
    timestamp,
  }
}

export const getTokenAmountBalance = (tokenAmount: TokenAmount): number =>
  Object.values(tokenAmount)
    .map((b) => b.amount * b.price)
    .reduce((x, y) => x + y, 0)

export const getTotalBalance = (
  accountBalance?: AccountBalance
): { balance: number; timestamp: number } => {
  if (!accountBalance) {
    return {
      balance: 0,
      timestamp: 0,
    }
  }
  const { balance, timestamp } = accountBalance
  return {
    balance: Object.values(balance)
      .map(getTokenAmountBalance)
      .reduce((x, y) => x + y, 0),
    timestamp,
  }
}

export const getWalletsBalancesFromAccountsBalances = (
  wallets: Wallet[],
  accounts: AccountWithBalance[]
): WalletWithBalance[] =>
  wallets.map((w) => {
    const accBalances = accounts
      .filter((a) => a.walletId === w.id)
      .map((a) => a.balances.map((b) => getTotalBalance(b)))
    let balances = accBalances[0] || []
    drop(accBalances).forEach((ab) => {
      balances = balances.map((b, i) => ({
        balance: b.balance + ab[i].balance,
        timestamp: b.timestamp,
      }))
    })
    return {
      ...w,
      balances: balances.sort((a, b) => a.timestamp - b.timestamp),
    }
  })

export const transformGqlAcountBalance = (data: any, timestamp: number): AccountBalance => {
  const denoms = get(data, 'account[0].available[0].tokens_prices', [])
  const balance = {
    available: getTokenAmountFromDenoms(get(data, 'account[0].available[0].coins', []), denoms),
    delegated: getTokenAmountFromDenoms(
      get(data, 'account[0].delegated.nodes', []).map((d) => d.amount),
      denoms
    ),
    unbonding: getTokenAmountFromDenoms(
      get(data, 'account[0].unbonding.nodes', []).map((d) => d.amount),
      denoms
    ),
    rewards: getTokenAmountFromDenoms(
      get(data, 'account[0].rewards.nodes', []).map((d) => get(d, 'amount[0]')),
      denoms
    ),
    commissions: getTokenAmountFromDenoms(
      get(data, 'account[0].validator.validator.commissions.nodes', []).map((d) => d.amount),
      denoms
    ),
  }
  return {
    balance,
    timestamp,
  }
}

const statuses = ['unknown', 'unbonded', 'unbonded', 'active']

export const getValidatorStatus = (status: number, jailed: boolean): string => {
  if (jailed) {
    return 'jailed'
  }
  return statuses[status]
}

export const transformValidators = (data: any): Validator[] => {
  if (!data) {
    return []
  }
  return data.validator
    .map((validator) => ({
      address: get(validator, 'info.operator_address', ''),
      image: get(validator, 'description[0].avatar_url', ''),
      name: get(validator, 'description[0].moniker', get(validator, 'address', '')),
      commission: get(validator, 'commission[0].commission', 0),
      votingPower: get(validator, 'voting_power[0].voting_power', 0),
      selfRatio: 0, // TODO: solve performance issue on BDJuno
      status: getValidatorStatus(
        get(validator, 'status[0].status', 0),
        get(validator, 'status[0].jailed', false)
      ),
      isActive: get(validator, 'status[0].status', 0) === statuses.indexOf('active'),
    }))
    .sort((a, b) => b.votingPower - a.votingPower)
    .map((validator, i) => ({
      ...validator,
      rank: i + 1,
    }))
}

export const transformValidatorsWithTokenAmount = (data: any, balanceData: any) => {
  const validators = transformValidators(data)
  const tokensPrices = get(balanceData, 'account[0].available[0].tokens_prices', [])
  const delegatedByValidator = {}
  get(balanceData, 'account[0].delegated.nodes', []).forEach((d) => {
    delegatedByValidator[
      get(d, 'validator.validator_info.operator_address', '')
    ] = getTokenAmountFromDenoms([d.amount], tokensPrices)
  })
  const rewardsByValidator = {}
  get(balanceData, 'account[0].rewards.nodes', []).forEach((d) => {
    rewardsByValidator[
      get(d, 'validator.validator_info.operator_address', '')
    ] = getTokenAmountFromDenoms(d.amount, tokensPrices)
  })
  const unbondingByValidator = {}
  get(balanceData, 'account[0].unbonding.nodes', []).forEach((d) => {
    unbondingByValidator[
      get(d, 'validator.validator_info.operator_address', '')
    ] = getTokenAmountFromDenoms([d.amount], tokensPrices)
  })
  return validators.map((v) => ({
    ...v,
    delegated: delegatedByValidator[v.address],
    rewards: rewardsByValidator[v.address],
    unbonding: unbondingByValidator[v.address],
  }))
}

export const transformUnbonding = (data: any, balanceData: any): Unbonding[] => {
  const validators = keyBy(transformValidators(data), 'address')
  const tokensPrices = get(balanceData, 'account[0].available[0].tokens_prices', [])
  return get(balanceData, 'account[0].unbonding.nodes', []).map((u) => ({
    validator: validators[get(u, 'validator.validator_info.operator_address', '')],
    amount: getTokenAmountFromDenoms([u.amount], tokensPrices),
    height: Number(u.height),
    completionDate: new Date(u.completion_timestamp),
  }))
}

export const transformRedelegations = (data: any, balanceData: any): Redelegation[] => {
  const tokensPrices = get(balanceData, 'account[0].available[0].tokens_prices', [])
  return get(data, 'redelegations', []).map((u) => ({
    fromValidator: {
      name: get(
        u,
        'from_validator.description[0].moniker',
        get(u, 'from_validator.info.operator_address', '')
      ),
      address: get(u, 'from_validator.info.operator_address', ''),
      image: get(u, 'from_validator.description[0].avatar_url', ''),
    },
    toValidator: {
      name: get(
        u,
        'to_validator.description[0].moniker',
        get(u, 'to_validator.info.operator_address', '')
      ),
      address: get(u, 'to_validator.info.operator_address', ''),
      image: get(u, 'to_validator.description[0].avatar_url', ''),
    },
    amount: getTokenAmountFromDenoms([u.amount], tokensPrices),
    height: Number(u.height),
    completionDate: new Date(u.completion_timestamp),
  }))
}

export const transformTransactions = (
  data: any,
  validatorsMap: { [address: string]: Validator },
  tokensPrices: TokenPrice[]
): Activity[] => {
  return get(data, 'messages_by_address', [])
    .map((t) => {
      if (t.type.includes('MsgSend')) {
        return {
          ref: `#${get(t, 'transaction_hash', '')}`,
          tab: 'transfer',
          tag: 'send',
          date: `${format(
            new Date(get(t, 'transaction.block.timestamp')),
            'dd MMM yyyy HH:mm'
          )} UTC`,
          detail: {
            address: get(t, 'value.to_address', ''),
          },
          amount: getTokenAmountFromDenoms(get(t, 'value.amount', []), tokensPrices),
          success: get(t, 'transaction.success', false),
        }
      }
      if (t.type.includes('MsgDelegate')) {
        return {
          ref: `#${get(t, 'transaction_hash', '')}`,
          tab: 'staking',
          tag: 'delegate',
          date: `${format(
            new Date(get(t, 'transaction.block.timestamp')),
            'dd MMM yyyy HH:mm'
          )} UTC`,
          detail: {
            name: get(validatorsMap, `${get(t, 'value.validator_address', '')}.name`, ''),
            image: get(validatorsMap, `${get(t, 'value.validator_address', '')}.image`, ''),
          },
          amount: getTokenAmountFromDenoms([get(t, 'value.amount', {})], tokensPrices),
          success: get(t, 'transaction.success', false),
        }
      }
      if (t.type.includes('MsgBeginRedelegate')) {
        return {
          ref: `#${get(t, 'transaction_hash', '')}`,
          tab: 'staking',
          tag: 'redelegate',
          date: `${format(
            new Date(get(t, 'transaction.block.timestamp')),
            'dd MMM yyyy HH:mm'
          )} UTC`,
          detail: {
            src: {
              name: get(validatorsMap, `${get(t, 'value.validator_src_address', '')}.name`, ''),
              image: get(validatorsMap, `${get(t, 'value.validator_src_address', '')}.image`, ''),
            },
            dst: {
              name: get(validatorsMap, `${get(t, 'value.validator_dst_address', '')}.name`, ''),
              image: get(validatorsMap, `${get(t, 'value.validator_dst_address', '')}.image`, ''),
            },
          },
          amount: getTokenAmountFromDenoms([get(t, 'value.amount', {})], tokensPrices),
          success: get(t, 'transaction.success', false),
        }
      }
      if (t.type.includes('MsgUndelegate')) {
        return {
          ref: `#${get(t, 'transaction_hash', '')}`,
          tab: 'staking',
          tag: 'undelegate',
          date: `${format(
            new Date(get(t, 'transaction.block.timestamp')),
            'dd MMM yyyy HH:mm'
          )} UTC`,
          detail: {
            name: get(validatorsMap, `${get(t, 'value.validator_address', '')}.name`, ''),
            image: get(validatorsMap, `${get(t, 'value.validator_address', '')}.image`, ''),
          },
          amount: getTokenAmountFromDenoms([get(t, 'value.amount', {})], tokensPrices),
          success: get(t, 'transaction.success', false),
        }
      }
      return null
    })
    .filter((a) => !!a)
}

export const getEquivalentCoinToSend = (
  amount: { amount: number; denom: string },
  availableCoins: Array<{ amount: string; denom: string }>,
  tokensPrices: TokenPrice[]
): { amount: number; denom: string } => {
  const tokenPrice = tokensPrices.find((tp) => tp.unit_name === amount.denom)
  if (!tokenPrice) {
    return { amount: 0, denom: '' }
  }
  const coinDenom: { denom: string; exponent: number } = get(
    tokenPrice,
    'token_unit.token.token_units',
    []
  ).find((unit) => !!availableCoins.find((c) => c.denom === unit.denom))
  return {
    amount: amount.amount * 10 ** (get(tokenPrice, 'token_unit.exponent', 0) - coinDenom.exponent),
    denom: coinDenom.denom,
  }
}

export const createEmptyChartData = (
  rawData: Array<{
    balance: number
    timestamp: number
  }>,
  from: number,
  to: number
): Array<{ balance: number; timestamp: number }> => {
  // Create a straight line
  const data = cloneDeep(rawData)
  if (data.length === 0) {
    data.unshift(
      {
        balance: 0,
        timestamp: from,
      },
      {
        balance: 0,
        timestamp: to,
      }
    )
  } else if (data.length === 1) {
    data.unshift({ balance: data[0].balance, timestamp: from })
  }
  return data
}

export const getCoinPrice = (coin: string): Promise<number> =>
  fetch(
    `${process.env.NEXT_PUBLIC_COINGECKO_API_URL}/coins/${coin}/market_chart?vs_currency=usd&days=1&interval=daily`
  ).then(async (result) => {
    const data = await result.json()
    return get(last(get(data, 'prices', [])), 1)
  })
