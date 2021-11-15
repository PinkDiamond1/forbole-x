import { Box, Typography, Divider, Button } from '@material-ui/core'
import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useSubscription, gql } from '@apollo/client'
import useStyles from './styles'
import { useWalletsContext } from '../../contexts/WalletsContext'
import { formatTokenAmount, transformValidatorsWithTokenAmount } from '../../misc/utils'
import DelegationDialog from '../DelegationDialog'
import WithdrawRewardsDialog from '../WithdrawRewardsDialog'
import SendDialog from '../SendDialog'
import { getValidators } from '../../graphql/queries/validators'

interface ChromeExtBottomProps {
  availableTokens: AvailableTokens
  delegated: TokenAmount
  rewards: TokenAmount
  account: Account
  balanceData: any
}

const ChromeExtBottom: React.FC<ChromeExtBottomProps> = ({
  availableTokens,
  delegated,
  rewards,
  account,
  balanceData,
}) => {
  const classes = useStyles()
  const { t, lang } = useTranslation('common')
  const { wallets } = useWalletsContext()
  const wallet = wallets.find((w) => w.id === account.walletId)

  const [delegateDialogOpen, setDelegateDialogOpen] = React.useState(false)
  const [withdrawRewardsDialogOpen, setWithdrawRewardsDialogOpen] = React.useState(false)
  const [sendDialogOpen, setSendDialogOpen] = React.useState(false)

  const { data: validatorsData } = useSubscription(
    gql`
      ${getValidators(account.crypto)}
    `
  )
  const validators = React.useMemo(
    () => transformValidatorsWithTokenAmount(validatorsData, balanceData),
    [validatorsData, balanceData]
  )

  return (
    <>
      <Box my={2}>
        <Divider />
      </Box>
      <Box display="flex" mb={2}>
        <Box mr={8}>
          <Typography variant="body2" color="textSecondary">
            {t('pending rewards')}
          </Typography>
          <Typography variant="h6">{formatTokenAmount(rewards, account.crypto, lang)}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {t('delegate inflation', { inflation: '20%' })}
          </Typography>
          <Typography variant="h6">{formatTokenAmount(delegated, account.crypto, lang)}</Typography>
        </Box>
      </Box>
      <Box display="flex">
        <Button
          classes={{ root: classes.delegateButton }}
          variant="contained"
          color="primary"
          onClick={() => setDelegateDialogOpen(true)}
        >
          {t('delegate')}
        </Button>
        <Button
          classes={{ root: classes.sendButton }}
          variant="contained"
          onClick={() => setSendDialogOpen(true)}
        >
          {t('send')}
        </Button>
        <Button
          classes={{ root: classes.withdrawButton }}
          variant="contained"
          color="secondary"
          onClick={() => setWithdrawRewardsDialogOpen(true)}
        >
          {t('withdraw')}
        </Button>
      </Box>
      <DelegationDialog
        open={delegateDialogOpen}
        onClose={() => setDelegateDialogOpen(false)}
        account={account}
        availableTokens={availableTokens}
        validators={validators}
      />
      <WithdrawRewardsDialog
        wallet={wallet}
        open={withdrawRewardsDialogOpen}
        onClose={() => setWithdrawRewardsDialogOpen(false)}
        account={account}
        tokensPrices={availableTokens.tokens_prices}
        validators={validators.filter((v) => !!v.rewards)}
        openDelegationDialog={() => setDelegateDialogOpen(true)}
      />
      <SendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        account={account}
        availableTokens={availableTokens}
      />
    </>
  )
}

export default ChromeExtBottom