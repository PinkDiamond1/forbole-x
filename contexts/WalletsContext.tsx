import React from 'react'
import sendMsgToChromeExt from '../misc/sendMsgToChromeExt'

interface WalletsState {
  isFirstTimeUser: boolean
  isUnlocked: boolean
  wallets: Wallet[]
  accounts: Account[]
  password: string
  unlockWallets?: (password: string) => void
  addWallet?: (wallet: CreateWalletParams) => void
  updateWallet?: (id: string, wallet: UpdateWalletParams) => void
  deleteWallet?: (id: string) => void
  addAccount?: (account: CreateAccountParams) => void
  updateAccount?: (address: string, account: UpdateAccountParams) => void
  deleteAccount?: (address: string) => void
}

const initialState: WalletsState = {
  isFirstTimeUser: false,
  isUnlocked: false,
  wallets: [],
  accounts: [],
  password: '',
}

const WalletsContext = React.createContext<WalletsState>(initialState)

const WalletsProvider: React.FC = ({ children }) => {
  const [wallets, setWallets] = React.useState<Wallet[]>([])
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [isFirstTimeUser, setIsFirstTimeUser] = React.useState(false)
  const [password, setPassword] = React.useState('')

  const checkIsFirstTimeUser = React.useCallback(async () => {
    const response = await sendMsgToChromeExt({
      event: 'ping',
    })
    setIsFirstTimeUser(response.isFirstTimeUser)
  }, [])

  const unlockWallets = React.useCallback(
    async (pw: string) => {
      if (!isFirstTimeUser) {
        const walletaResponse = await sendMsgToChromeExt({
          event: 'getWallets',
          data: {
            password: pw,
          },
        })
        const accountsResponse = await sendMsgToChromeExt({
          event: 'getAccounts',
          data: {
            password: pw,
          },
        })
        setWallets(walletaResponse.wallets)
        setAccounts(accountsResponse.accounts)
      }
      setPassword(pw)
    },
    [isFirstTimeUser]
  )

  const addWallet = React.useCallback(
    async (wallet: CreateWalletParams) => {
      const result = await sendMsgToChromeExt({
        event: 'addWallet',
        data: {
          wallet,
          password,
        },
      })
      setIsFirstTimeUser(false)
      setWallets((ws) => [result.wallet, ...ws])
      setAccounts((acs) => [...result.accounts, ...acs])
    },
    [password]
  )

  const updateWallet = React.useCallback(
    async (id: string, wallet: UpdateWalletParams) => {
      const result = await sendMsgToChromeExt({
        event: 'updateWallet',
        data: {
          wallet,
          id,
          password,
        },
      })
      setWallets((ws) => ws.map((w) => (w.id === id ? result.wallet : w)))
    },
    [password]
  )

  const deleteWallet = React.useCallback(
    async (id: string) => {
      await sendMsgToChromeExt({
        event: 'deleteWallet',
        data: {
          id,
          password,
        },
      })
      setWallets((ws) => ws.filter((w) => w.id !== id))
    },
    [password]
  )

  const addAccount = React.useCallback(
    async (account: CreateAccountParams) => {
      const result = await sendMsgToChromeExt({
        event: 'addAccount',
        data: {
          account,
          password,
        },
      })
      setAccounts((acs) => [result.account, ...acs])
    },
    [password]
  )

  const updateAccount = React.useCallback(
    async (address: string, account: UpdateAccountParams) => {
      const result = await sendMsgToChromeExt({
        event: 'updateAccount',
        data: {
          account,
          address,
          password,
        },
      })
      setAccounts((acs) => acs.map((a) => (a.address === address ? result.account : a)))
    },
    [password]
  )

  const deleteAccount = React.useCallback(
    async (address: string) => {
      await sendMsgToChromeExt({
        event: 'deleteAccount',
        data: {
          address,
          password,
        },
      })
      setAccounts((acs) => acs.filter((a) => a.address !== address))
    },
    [password]
  )

  React.useEffect(() => {
    checkIsFirstTimeUser()
  }, [])

  return (
    <WalletsContext.Provider
      value={{
        isFirstTimeUser,
        isUnlocked: !!wallets.length,
        wallets,
        accounts,
        password,
        unlockWallets,
        addWallet,
        updateWallet,
        deleteWallet,
        addAccount,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </WalletsContext.Provider>
  )
}

const useWalletsContext = (): WalletsState => React.useContext(WalletsContext)

export { WalletsProvider, useWalletsContext }
