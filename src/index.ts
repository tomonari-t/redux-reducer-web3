import { Dispatch } from 'redux'
import actionCreatorFactory from 'typescript-fsa'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
const Web3 = require('web3')

export enum WalletConnectedNetWork {
  main = 1,
  ropsten = 3,
  rinkeby = 4,
  kovan = 42,
}

const NetworkNameMap = {
  [WalletConnectedNetWork.main]: 'Main Ethereum Network',
  [WalletConnectedNetWork.kovan]: 'Kovan Test Network',
  [WalletConnectedNetWork.rinkeby]: 'Rinkeby Test Network',
  [WalletConnectedNetWork.ropsten]: 'Ropsten Test Network',
}

const getNetworkName = (networkId: WalletConnectedNetWork) => {
  return NetworkNameMap[networkId]
}

export enum WalletStatus {
  uninitialized,
  walletNotFound,
  walletAvailable,
  walletLocked,
}

/**
 * action
 */

const SET_WEB3_INSTANCE = 'setWeb3Instance'
const SET_USER_ADDRESS = 'setUserAddress'
const SET_NETWORK = 'setNetwork'
const SET_STATUS = 'setStatus'
const SET_METAMASK_FLAG = 'setMetamaskFlag'
const SET_PRIVACY_MODE_STATUS = 'setMetamaskPrivacyMode'

/**
 * actino creator
 */

const factory = actionCreatorFactory('@@redux-web3')
export const setWeb3Instance = factory<{ web3: any }>(SET_WEB3_INSTANCE)
export const setUserWlletAddress = factory<{ address: string }>(
  SET_USER_ADDRESS,
)
export const setNetwork = factory<{
  network: WalletConnectedNetWork
}>(SET_NETWORK)
export const setStatus = factory<{ status: WalletStatus }>(SET_STATUS)

export const setMetamaskFlag = factory<{ isMetamask: boolean }>(
  SET_METAMASK_FLAG,
)
export const setPrivacyModeStatus = factory<{ isEnable: boolean }>(
  SET_PRIVACY_MODE_STATUS,
)

export const enableMetamask = () => async (
  dispatch: Dispatch,
  getState: () => {} & { web3: IWeb3State }, // TODO
) => {
  const { web3 } = getState()

  if (!web3.isMetamask) {
    return
  }

  try {
    await (window as any).ethereum.enable()
    dispatch(setPrivacyModeStatus({ isEnable: true }))
  } catch (err) {
    dispatch(setPrivacyModeStatus({ isEnable: false }))
  }
}

export const updateWeb3 = () => async (
  dispatch: Dispatch,
  getState: () => {} & { web3: IWeb3State }, // TODO
) => {
  let instance = getState().web3.web3Instance
  const { status } = getState().web3
  if (typeof Web3.givenProvider === 'undefined') {
    dispatch(setStatus({ status: WalletStatus.walletNotFound }))
  } else {
    if (!instance) {
      instance = new Web3(Web3.givenProvider)
      dispatch(setWeb3Instance({ web3: instance }))
    }

    if (typeof (global as any).ethereum !== 'undefined') {
      dispatch(setMetamaskFlag({ isMetamask: true }))
    } else {
      dispatch(setMetamaskFlag({ isMetamask: false }))
    }
    if (
      status === WalletStatus.uninitialized ||
      status === WalletStatus.walletNotFound
    ) {
      instance.setProvider(Web3.givenProvider)
    }
    const address = await instance.eth.getAccounts()
    if (address.length === 0) {
      dispatch(setStatus({ status: WalletStatus.walletLocked }))
    } else {
      dispatch(setUserWlletAddress({ address: address[0] }))
      dispatch(setStatus({ status: WalletStatus.walletAvailable }))
    }
  }

  if (instance) {
    const networkId = await instance.eth.net.getId()
    dispatch(setNetwork({ network: networkId }))
  }
}

/**
 * reducer
 */

export interface IWeb3State {
  web3Instance: any | undefined
  userWalletAddress: string
  network: WalletConnectedNetWork
  status: WalletStatus
  isMetamask: boolean
  isPrivacyEnable: boolean
  networkName: string
}

export const INITIAL_STATE: IWeb3State = {
  web3Instance: undefined,
  userWalletAddress: '',
  network: WalletConnectedNetWork.main,
  status: WalletStatus.uninitialized,
  isMetamask: false,
  isPrivacyEnable: false,
  networkName: '',
}

export default reducerWithInitialState(INITIAL_STATE)
  .case(setWeb3Instance, (state, { web3 }) => ({
    ...state,
    web3Instance: web3,
  }))
  .case(setUserWlletAddress, (state, { address }) => ({
    ...state,
    userWalletAddress: address,
  }))
  .case(setNetwork, (state, { network }) => {
    const name = getNetworkName(network)
    return {
      ...state,
      network,
      networkName: name,
    }
  })
  .case(setStatus, (state, { status }) => ({
    ...state,
    status,
  }))
  .case(setMetamaskFlag, (state, { isMetamask }) => ({
    ...state,
    isMetamask,
  }))
  .case(setPrivacyModeStatus, (state, { isEnable }) => ({
    ...state,
    isPrivacyEnable: isEnable,
  }))
