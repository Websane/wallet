import type { FC, HTMLAttributes, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Spinner } from '@components/Spinner/Spinner';

import styles from './Button.module.scss';

type ButtonProps = Pick<HTMLAttributes<HTMLButtonElement>, 'className'> & {
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  onClick,
  isLoading,
  isDisabled,
  type = 'button',
  className,
}) => {
  return (
    <button className={classNames(styles.button, className)} disabled={isDisabled} type={type} onClick={onClick}>
      {isLoading && <Spinner className={styles.spinner} />}
      {children}
    </button>
  );
};
