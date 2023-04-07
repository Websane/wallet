import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { JsonRpcProvider, JsonRpcSigner, Wallet, ethers } from 'ethers';

type AccountInfo = {
  address: string;
  balance: string;
}

const getAddressBalance = async (provider: JsonRpcProvider, address: string) => {
  const rawBalance = await provider.getBalance(address);
  const balance = ethers.formatEther(rawBalance);
  return balance;
};

const getAccountsInfo = async (accounts: JsonRpcSigner[], provider: JsonRpcProvider) => {
  const accountsInfo: AccountInfo[] = [];

  for (const account of accounts) {
    const address = account.address;
    const balance = await getAddressBalance(provider, address);

    accountsInfo.push({ address, balance });
  }

  return accountsInfo;
};

export const UserWallet = () => {
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [accounts, setAccounts] = useState<JsonRpcSigner[]>([]);
  const [accountsInfo, setAccountsInfo] = useState<AccountInfo[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState(0);

  const connectToProvider = async () => {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Подключаемся к локальному блокчейну
    setProvider(provider);
    const accounts = await provider.listAccounts();
    setAccounts(accounts);
    const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123'; // Приватный ключ
    const wallet = new ethers.Wallet(privateKey, provider); // Создаем кошелек на основе приватного ключа и провайдера
    setWallet(wallet);

    const fromAddress = await wallet.getAddress(); // Получаем адрес кошелька
    setFrom(fromAddress);
  };

  useEffect(() => {
    if (accounts.length > 0 && provider) {
      getAccountsInfo(accounts, provider).then(info => setAccountsInfo(info))
    }
  }, [accounts])

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
            {accountsInfo.map(({address, balance}) => (
              <li key={address}>
                <span>Address: {address}</span>
                <span>Balance: {balance} ETH</span>
              </li>
            ))}
          </ul>
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
