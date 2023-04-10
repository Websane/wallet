import type { FC } from 'react';
import styles from './ConnectWallet.module.scss';
import type { StringOrNull } from '@components/Main/Main';

type ConnectWalletProps = {
  connectWallet: () => void;
  dismissError?: () => void;
  networkError?: StringOrNull;
};

export const ConnectWallet: FC<ConnectWalletProps> = ({ networkError, connectWallet, dismissError }) => {
  return (
    <div className={styles.connect}>
      {networkError && (
        <div>
          <p>{networkError}</p>
          <button className={styles.button} onClick={dismissError}>
            Dismiss
          </button>
        </div>
      )}
      <p className={styles.connectButton}>Connect your Wallet: </p>
      <button className={styles.button} onClick={connectWallet}>
        Connect
      </button>
    </div>
  );
};
