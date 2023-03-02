import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';
import { ReactComponent as IconColorPicker } from 'src/modules/main/assets/IconColorPicker.svg';
import pictureSrc from 'src/modules/main/assets/FHD_Picture.jpg';
import {
  MAX_CANVAS_SIZE,
  MAGNIFIER_ZOOM,
  MAGNIFIER_RADIUS,
  MAGNIFIER_BORDER_WIDTH,
  FRAME_DURATION,
  MAGNIFIER_SIZE,
} from 'src/modules/main/constants';
import { rgbToHex } from 'src/helpers/converters';
import { SelectedColor } from 'src/modules/main/components/selected-color';

import styles from './app.module.css';

export const App: FC = () => {
  const [active, setActive] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const getCanvasContext = useCallback(() => {
    const canvasCtx = canvasRef.current?.getContext('2d');

    if (!canvasCtx) {
      throw new Error('An error has occurred while getting canvas context');
    }

    return canvasCtx;
  }, []);

  const getImage = useCallback(() => {
    const image = imageRef.current;

    if (!image) {
      throw new Error('An error has occurred while getting loaded image');
    }

    return image;
  }, []);

  const clearImage = useCallback(() => {
    const canvasCtx = getCanvasContext();
    const image = getImage();

    canvasCtx.drawImage(image, 0, 0);
  }, [getCanvasContext, getImage]);

  const toggleActive = useCallback(() => {
    setActive((active) => !active);
    clearImage();
  }, [clearImage]);

  const changeCurrentColor = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    ({ nativeEvent }) => {
      if (!active) {
        return;
      }

      const canvasCtx = getCanvasContext();
      const image = getImage();
      const { offsetX, offsetY } = nativeEvent;
      const { data } = canvasCtx.getImageData(offsetX, offsetY, 1, 1);
      const [r, g, b] = data;
      const currentColor = `#${rgbToHex(r, g, b)}`.toUpperCase();

      setCurrentColor(currentColor);

      canvasCtx.drawImage(image, 0, 0);
      canvasCtx.save();

      // draw the magnified part of image clipped in a circle
      canvasCtx.beginPath();
      canvasCtx.arc(offsetX, offsetY, MAGNIFIER_RADIUS, 0, 2 * Math.PI);
      canvasCtx.closePath();
      canvasCtx.clip();
      canvasCtx.drawImage(
        image,
        offsetX - MAGNIFIER_RADIUS / MAGNIFIER_ZOOM,
        offsetY - MAGNIFIER_RADIUS / MAGNIFIER_ZOOM,
        MAGNIFIER_SIZE / MAGNIFIER_ZOOM,
        MAGNIFIER_SIZE / MAGNIFIER_ZOOM,
        offsetX - MAGNIFIER_RADIUS,
        offsetY - MAGNIFIER_RADIUS,
        MAGNIFIER_SIZE,
        MAGNIFIER_SIZE
      );

      // draw the frame
      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.arc(offsetX, offsetY, MAGNIFIER_RADIUS, 0, 2 * Math.PI);
      canvasCtx.strokeStyle = currentColor;
      canvasCtx.lineWidth = MAGNIFIER_BORDER_WIDTH;
      canvasCtx.shadowOffsetX = 0;
      canvasCtx.shadowOffsetY = 0;
      canvasCtx.shadowBlur = 4;
      canvasCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      canvasCtx.stroke();

      // draw a current color text
      canvasCtx.beginPath();
      const textWidth = canvasCtx.measureText(currentColor).width;
      canvasCtx.fillStyle = 'white';
      canvasCtx.roundRect(
        offsetX - textWidth / 2 - 10,
        offsetY + MAGNIFIER_RADIUS / 2 - 14,
        textWidth + 20,
        20,
        [5]
      );
      canvasCtx.fill();
      // rollback shadow and stroke settings
      canvasCtx.restore();
      canvasCtx.font = '12px Arial';
      canvasCtx.fillStyle = 'Black';
      canvasCtx.fillText(
        currentColor,
        offsetX - textWidth / 2 - 4,
        offsetY + MAGNIFIER_RADIUS / 2
      );
      canvasCtx.clip();

      canvasCtx.restore();
    },
    [active, getCanvasContext, getImage]
  );

  const debouncedChangeCurrentColor = useDebouncedCallback(
    changeCurrentColor,
    FRAME_DURATION
  );

  const selectColor = useCallback<MouseEventHandler<HTMLCanvasElement>>(() => {
    if (!active) {
      return;
    }

    setSelectedColor(currentColor);
    setActive(false);
    clearImage();
  }, [active, clearImage, currentColor]);

  useEffect(() => {
    const image = new Image();

    image.src = pictureSrc;
    image.onload = () => {
      imageRef.current = image;
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
          onClick={selectColor}
          onMouseMove={debouncedChangeCurrentColor}
        />
      </main>
    </div>
  );
};

export default App;
