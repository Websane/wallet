import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { JsonRpcProvider, JsonRpcSigner, Wallet, ethers } from 'ethers';

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

export const UserWallet = () => {
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [accountsInfo, setAccountsInfo] = useState<AccountInfo[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletBalance, setWalletBalance] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState(0);

  const connectToProvider = async () => {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Подключаемся к локальному блокчейну
    setProvider(provider);

    const hardhatAccountPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const hardhatAccountWallet = new ethers.Wallet(hardhatAccountPrivateKey, provider);

    const userPrivateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const userWallet = new ethers.Wallet(userPrivateKey, provider);
    setWallet(wallet);

    const fromAddress = await userWallet.getAddress();

    setWalletAddress(fromAddress);

    // Отправляем средства с тестового аккаунта на целевой кошелек
    const tx = await hardhatAccountWallet.sendTransaction({
      to: fromAddress,
      value: ethers.parseEther('150'),
    });
    await tx.wait();
  };

  const handleAccountsInfoUpdate = async () => {
    if (provider) {
      const accounts = await provider.listAccounts();
      getAccountsInfo(accounts, provider).then((info) => setAccountsInfo(info));
    }
  };

  const handleWalletBalanceUpdate = async () => {
    if (provider) {
      getAddressBalance(walletAddress, provider).then((balance) => setWalletBalance(balance));
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
        const tx = await wallet.sendTransaction({
          to: to,
          value: ethers.parseEther(String(value)),
        });
        console.log('Transaction sent: ', tx.hash);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!provider) return <button onClick={connectToProvider}>Connect</button>;

  return (
    <div>
      <h2>Wallet</h2>
      {accountsInfo && (
        <div>
          <p>Connected</p>
          <p>Accounts:</p>
          <ul>
            {accountsInfo.map(({ address, balance }) => (
              <li key={address} style={{ display: 'grid', maxWidth: '650px', border: '1px solid black' }}>
                <span>Address: {address}</span>
                <span>
                  Balance: {balance} {UNIT}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={handleAccountsInfoUpdate}>Update info</button>
        </div>
      )}
      {walletAddress && (
        <div>
          <p>Your new account: {walletAddress}</p>
          <p>
            Balance: {walletBalance} {UNIT}
          </p>
          <button onClick={handleWalletBalanceUpdate}>Update your balance</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="to">To:</label>
        <input type="text" id="to" value={to} onChange={handleToChange} />
        <label htmlFor="value">Value:</label>
        <input type="text" id="value" value={value} onChange={handleValueChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
