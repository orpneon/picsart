import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ReactComponent as IconColorPicker } from 'src/modules/main/assets/IconColorPicker.svg';
import pictureSrc from 'src/modules/main/assets/FHD_Picture.jpg';
import { MAX_CANVAS_SIZE } from 'src/modules/main/constants';
import { rgbToHex } from 'src/helpers/converters';
import { SelectedColor } from 'src/modules/main/components/selected-color';

import styles from './app.module.css';

export const App: FC = () => {
  const [active, setActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleActive = useCallback(() => {
    setActive((active) => !active);
  }, []);

  const selectColor = useCallback((value: string) => {
    setSelectedColor(value);
    setActive(false);
  }, []);

  const getCanvasContext = useCallback(() => {
    const canvasCtx = canvasRef.current?.getContext('2d');

    if (!canvasCtx) {
      throw new Error('An error has occurred while getting canvas context');
    }

    return canvasCtx;
  }, []);

  const chooseColor = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    ({ nativeEvent }) => {
      if (!active) {
        return;
      }

      const canvasCtx = getCanvasContext();
      const { offsetX, offsetY } = nativeEvent;
      const { data } = canvasCtx.getImageData(offsetX, offsetY, 1, 1);
      const [r, g, b] = data;

      selectColor(`#${rgbToHex(r, g, b)}`);
    },
    [active, getCanvasContext, selectColor]
  );

  useEffect(() => {
    const image = new Image();

    image.src = pictureSrc;
    image.onload = () => {
      const { width, height } = image;

      if (!width || !height) {
        throw new Error('Image has incorrect size');
      }

      if (!canvasRef.current) {
        throw new Error('An error has occurred during canvas render');
      }

      canvasRef.current.width = Math.min(width, MAX_CANVAS_SIZE);
      canvasRef.current.height = Math.min(height, MAX_CANVAS_SIZE);

      const canvasCtx = getCanvasContext();
      canvasCtx.drawImage(image, 0, 0);
    };
  }, [getCanvasContext]);

  return (
    <div className={styles.container}>
      <header>
        <h1>Color dropper</h1>
      </header>

      <main>
        <div className={styles.controls}>
          <div
            className={classNames(styles['color-picker'], {
              [styles.active]: active,
            })}
            onClick={toggleActive}
          >
            <IconColorPicker />
          </div>

          <SelectedColor active={active} selectedColor={selectedColor} />
        </div>

        <canvas
          className={classNames(styles.canvas, {
            [styles.active]: active,
          })}
          ref={canvasRef}
          onClick={chooseColor}
        />
      </main>
    </div>
  );
};

export default App;
