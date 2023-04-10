import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { JsonRpcProvider, JsonRpcSigner, Wallet, ethers } from 'ethers';
import { HARDHAR_URI } from '@assets/constants';
import { Button } from '@components/Button/Button';

import styles from './UserWallet.module.scss';

type AccountInfo = {
  address: string;
  balance: string;
};

const UNIT = 'ETH';

const getAddressBalance = async (address: string, provider: JsonRpcProvider) => {
  const rawBalance = await provider.getBalance(address);
  const balance = ethers.formatEther(rawBalance);
  return balance;
};

const getAccountsInfo = async (accounts: JsonRpcSigner[], provider: JsonRpcProvider) => {
  const accountsInfo: AccountInfo[] = [];

  for (const account of accounts) {
    const address = account.address;
    const balance = await getAddressBalance(address, provider);

    accountsInfo.push({ address, balance });
  }

  return accountsInfo;
};

const sendEthFromHardhatDefaultAcc = async (currentProvider: JsonRpcProvider, to: string, value: number) => {
  if (currentProvider) {
    const hardhatAccountPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const hardhatAccountWallet = new ethers.Wallet(hardhatAccountPrivateKey, currentProvider);

    const tx = await hardhatAccountWallet.sendTransaction({
      to,
      value: ethers.parseEther(String(value)),
    });
    await tx.wait();
  }
};

export const UserWallet = () => {
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [accountsInfo, setAccountsInfo] = useState<AccountInfo[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletBalance, setWalletBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const connectToProvider = async () => {
    const provider = new ethers.JsonRpcProvider(HARDHAR_URI); // Подключаемся к локальному блокчейну
    setProvider(provider);

    const userPrivateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const userWallet = new ethers.Wallet(userPrivateKey, provider);
    const fromAddress = await userWallet.getAddress();
    setWallet(userWallet);
    setWalletAddress(fromAddress);
  };

  const handleAccountsInfoUpdate = async () => {
    if (provider) {
      const accounts = await provider.listAccounts();
      setIsLoading(true);
      getAccountsInfo(accounts, provider)
        .then((info) => {
          setAccountsInfo(info);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleWalletBalanceUpdate = async () => {
    if (provider) {
      setIsLoading(true);
      getAddressBalance(walletAddress, provider)
        .then((balance) => setWalletBalance(balance))
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleGetMoreEthClick = () => {
    if (provider) {
      setIsLoading(true);
      sendEthFromHardhatDefaultAcc(provider, walletAddress, 150).finally(() => {
        setIsLoading(false);
        handleWalletBalanceUpdate();
        handleAccountsInfoUpdate();
      });
    }
  };

  useEffect(() => {
    handleAccountsInfoUpdate();
  }, [provider]);

  useEffect(() => {
    handleWalletBalanceUpdate();
  }, [walletAddress]);

  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTo(event.target.value);
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (wallet) {
      try {
        setIsLoading(true);
        const tx = await wallet.sendTransaction({
          to: to,
          value: ethers.parseEther(String(value)),
        });
        await tx.wait();
        handleWalletBalanceUpdate();
        handleAccountsInfoUpdate();
        console.log('Transaction sent: ', tx.hash);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  accountsInfo.splice(5, 100); // оставлю только 5 позиций
  if (!provider) return <Button onClick={connectToProvider}>Connect</Button>;

  return (
    <div>
      {accountsInfo.length > 0 && <p className={styles.notify}>Connected!</p>}
      <div className={styles.wallet}>
        <div className={styles.management}>
          {walletAddress && (
            <div className={styles.user}>
              <h3>Your new account:</h3>
              <div className={styles.item}>
                <span>Address: {walletAddress}</span>
                <span>
                  Balance: {walletBalance} {UNIT}
                </span>
              </div>
              <div className={styles.buttons}>
                <Button isLoading={isLoading} isDisabled={isLoading} onClick={handleGetMoreEthClick}>
                  Get more ETH!
                </Button>
                <Button isLoading={isLoading} isDisabled={isLoading} onClick={handleWalletBalanceUpdate}>
                  Update your balance
                </Button>
              </div>
            </div>
          )}
          <h3>Send ETH:</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.inputWrapper}>
              <span className={styles.label}>To:</span>
              <input className={styles.input} type="text" value={to} onChange={handleToChange} />
            </label>
            <label className={styles.inputWrapper}>
              <span className={styles.label}> Value:</span>
              <input className={styles.input} type="text" value={value} onChange={handleValueChange} />
            </label>
            <Button isLoading={isLoading} isDisabled={isLoading} className={styles.submit} type="submit">
              Send
            </Button>
          </form>
        </div>
        {accountsInfo.length > 0 && (
          <div className={styles.accounts}>
            <h3>Accounts:</h3>
            <ul className={styles.list}>
              {accountsInfo.map(({ address, balance }) => (
                <li key={address} className={styles.item}>
                  <span>Address: {address}</span>
                  <span>
                    Balance: {balance} {UNIT}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              className={styles.updateAccounts}
              onClick={handleAccountsInfoUpdate}>
              Update info
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
