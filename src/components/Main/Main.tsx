import { HARDHAT_NETWORK_ID } from '@assets/constants';
import { ConnectWallet } from '@components/ConnectWallet/ConnectWallet';
import type { Maybe } from '@metamask/providers/dist/utils';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

const INITIAL_STATE = {
  selectedAccount: null,
  txBeingSent: null,
  networkError: null,
  transactionError: null,
  balance: null,
};

export type StringOrNull = string | null;

export const Main = () => {
  const [selectedAccount, setSelectedAccount] = useState<StringOrNull>(INITIAL_STATE.selectedAccount);
  const [txBeingSent, setTxBeingSent] = useState<StringOrNull>(INITIAL_STATE.txBeingSent);
  const [networkError, setNetworkError] = useState<StringOrNull>(INITIAL_STATE.networkError);
  const [transactionError, setTransactionError] = useState<StringOrNull>(INITIAL_STATE.transactionError);
  const [balance, setBalance] = useState<StringOrNull>(INITIAL_STATE.balance);

  const metamask = window.ethereum;

  useEffect(() => {
    const accountChangeCallback =
      () =>
      ([newAddress]: string[]) => {
        if (!newAddress) {
          resetState();
        }

        initialize(newAddress);
      };

    const chainChangedCallback = () => {
      resetState();
    };

    metamask?.on('accountsChanged', accountChangeCallback);
    metamask?.on('chainChanged', chainChangedCallback);
  }, []);

  const connectWallet = async () => {
    if (!metamask) {
      setNetworkError('Please install Metamask!');
      return;
    }
    if (!checkNetwork()) return;

    const addresses: Maybe<string[]> = await metamask?.request({
      method: 'eth_requestAccounts',
    });


    if (addresses && addresses[0]) {
      initialize(addresses[0]);
    }
  };

  const resetState = () => {
    setSelectedAccount(INITIAL_STATE.selectedAccount);
    setTxBeingSent(INITIAL_STATE.txBeingSent);
    setNetworkError(INITIAL_STATE.networkError);
    setTransactionError(INITIAL_STATE.transactionError);
    setBalance(INITIAL_STATE.balance);
  };

  const initialize = async (selectedAddress: string) => {
    if (!metamask) {
      setNetworkError('Please install Metamask!');
      return;
    }

    const provider = new ethers.BrowserProvider(metamask);
    setSelectedAccount(selectedAddress);
    updateBalance(provider, selectedAddress);
  };

  const updateBalance = async (provider: ethers.BrowserProvider, address: string) => {
    const newBalance = (await provider.getBalance(address)).toString();
    setBalance(newBalance);
  };

  const checkNetwork = () => {
    const isHardhat = metamask?.networkVersion === HARDHAT_NETWORK_ID;

    if (!isHardhat) {
      setNetworkError('Please connect to hardhat localhost');
      return false;
    }

    return isHardhat;
  };

  const dismissNetworkError = () => setNetworkError(INITIAL_STATE.networkError);

  if (!selectedAccount)
    return (
      <ConnectWallet connectWallet={connectWallet} networkError={networkError} dismissError={dismissNetworkError} />
    );

  return (
    <div>
      {balance && (
        <div>
          <p>Your balance:</p>
          <p>{ethers.formatEther(balance)} ETH</p>
        </div>
      )}
    </div>
  );
};
