import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import reducer, {
  INITIAL_STATE,
  setMetamaskFlag,
  setNetwork,
  setPrivacyModeStatus,
  setStatus,
  setUserWlletAddress,
  setWeb3Instance,
  updateWeb3,
  WalletConnectedNetWork,
  WalletStatus,
} from '../index'
import { enableMetamask } from './../index'

describe('action creator', () => {
  it('should set instance', () => {
    const mockInstance: any = {}
    expect(
      reducer(undefined, setWeb3Instance({ web3: mockInstance })),
    ).toStrictEqual({
      ...INITIAL_STATE,
      web3Instance: mockInstance,
    })
  })

  it('should set address', () => {
    const mock = '0xabc'
    expect(
      reducer(undefined, setUserWlletAddress({ address: mock })),
    ).toStrictEqual({
      ...INITIAL_STATE,
      userWalletAddress: mock,
    })
  })

  it('should set network', () => {
    const network = WalletConnectedNetWork.kovan
    expect(reducer(undefined, setNetwork({ network }))).toStrictEqual({
      ...INITIAL_STATE,
      network,
      networkName: 'Kovan Test Network',
    })
  })

  it('should set wallet status', () => {
    const status = WalletStatus.uninitialized
    expect(reducer(undefined, setStatus({ status }))).toStrictEqual({
      ...INITIAL_STATE,
      status,
    })
  })

  it('should set metamsk flag', () => {
    const isMetamask = true
    expect(reducer(undefined, setMetamaskFlag({ isMetamask }))).toStrictEqual({
      ...INITIAL_STATE,
      isMetamask,
    })
  })

  it('should set privacy mode flag', () => {
    const isEnable = true
    expect(
      reducer(undefined, setPrivacyModeStatus({ isEnable })),
    ).toStrictEqual({
      ...INITIAL_STATE,
      isPrivacyEnable: isEnable,
    })
  })

  describe('async thunk action creator', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    describe('enableMetamsk', () => {
      beforeAll(() => {
        ; (global as any).ethereum = jest.fn()
        ; (global as any).ethereum.enable = jest
          .fn()
          .mockResolvedValue(undefined)
      })

      afterEach(() => {
        ; (global as any).ethereum.enable = jest.fn().mockReset()
      })

      it('should not dispatch anything with not metamask', async () => {
        const store = mockStore({ web3: { isMetamask: false } })
        await store.dispatch(enableMetamask() as any)
        expect(store.getActions()).toStrictEqual([])
      })

      it('should set isEnable true', async () => {
        const expected = [
          {
            payload: {
              isEnable: true,
            },
            type: '@@redux-web3/setMetamaskPrivacyMode',
          },
        ]
        ; (global as any).ethereum.enable = jest
          .fn()
          .mockResolvedValue(undefined)
        const store = mockStore({ web3: { isMetamask: true } })
        await store.dispatch(enableMetamask() as any)
        expect(store.getActions()).toStrictEqual(expected)
      })
    })

    it('should set isEnable false', async () => {
      const expected = [
        {
          payload: {
            isEnable: false,
          },
          type: '@@redux-web3/setMetamaskPrivacyMode',
        },
      ]
      ; (global as any).ethereum.enable = jest
        .fn()
        .mockRejectedValue(new Error('Async error'))
      const store = mockStore({ web3: { isMetamask: true } })
      await store.dispatch(enableMetamask() as any)
      expect(store.getActions()).toStrictEqual(expected)
    })

    describe('updateWeb3', () => {
      // TODO: web3 test
    })
  })
})
