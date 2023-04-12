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
        <div className={styles.error}>
          <p className={styles.errorText}>{networkError}</p>
          <Button className={styles.dismiss} onClick={dismissError}>Dismiss</Button>
        </div>
      )}
      <h3 className={styles.connectButton}>Connect your Wallet: </h3>
      <Button className={styles.button} onClick={connectWallet}>Connect</Button>
    </div>
  );
};
