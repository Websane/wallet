import type { FC, HTMLAttributes } from 'react';
import styles from './Spinner.module.scss';
import classNames from 'classnames';

export const Spinner: FC<Pick<HTMLAttributes<HTMLDivElement>, 'className'>> = ({ className }) => {
  return <div className={classNames(styles.spinner, className)} />;
};
