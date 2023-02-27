import { FC, memo } from 'react';

import styles from './selected-color.module.css';

type Props = {
  active: boolean;
  selectedColor: string | null;
};

export const SelectedColor: FC<Props> = memo(({ active, selectedColor }) => {
  const colorSelectTitle =
    selectedColor ?? (active ? 'Choose the color' : 'No color chosen');

  return (
    <div className={styles['selected-color']}>
      <span>{colorSelectTitle}</span>
      {selectedColor && (
        <span
          className={styles.example}
          style={{ backgroundColor: selectedColor }}
        />
      )}
    </div>
  );
});
