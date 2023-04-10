import type { FC } from 'react';
import type { StringOrNull } from '@components/Main/Main';
import { Button } from '@components/Button/Button';

import styles from './ConnectWallet.module.scss';

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
      <Button className={styles.button} onClick={connectWallet}>Connect</Button>
    </div>
  );
};
