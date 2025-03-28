import { ReactElement, useState } from 'react';
import { ColorDescriptor } from 'rxpoweredup';

export function ColorInput(props: { color: ColorDescriptor | undefined; onColorChange: (color: ColorDescriptor | undefined) => void }): ReactElement {
  const [red, setRed] = useState<string>(props.color?.red.toString() ?? '0');
  const [green, setGreen] = useState<string>(props.color?.green.toString() ?? '0');
  const [blue, setBlue] = useState<string>(props.color?.blue.toString() ?? '0');

  const isValid = (r: number, g: number, b: number): boolean => {
    return [r, g, b].every((v): boolean => !Number.isNaN(v) && v >= 0 && v <= 255);
  };

  const handleRedUpdate = (v: string): void => {
    setRed(v);
    const [r, g, b] = [v, green, blue].map((p): number => parseInt(p));
    props.onColorChange(isValid(r, g, b) ? { red: r, green: g, blue: b } : undefined);
  };

  const handleGreenUpdate = (v: string): void => {
    setGreen(v);
    const [r, g, b] = [red, v, blue].map((p): number => parseInt(p));
    props.onColorChange(isValid(r, g, b) ? { red: r, green: g, blue: b } : undefined);
  };

  const handleBlueUpdate = (v: string): void => {
    setBlue(v);
    const [r, g, b] = [red, green, v].map((p): number => parseInt(p));
    props.onColorChange(isValid(r, g, b) ? { red: r, green: g, blue: b } : undefined);
  };

  return (
    <>
      <label htmlFor={'red'}>Red</label>
      <input type={'number'} id={'red'} value={red} onChange={(event) => handleRedUpdate(event.target.value)} min={0} max={255} />
      <label htmlFor={'green'}>Green</label>
      <input type={'number'} id={'green'} value={green} onChange={(event) => handleGreenUpdate(event.target.value)} min={0} max={255} />
      <label htmlFor={'blue'}>Blue</label>
      <input type={'number'} id={'blue'} value={blue} onChange={(event) => handleBlueUpdate(event.target.value)} min={0} max={255} />
    </>
  );
}
