import { Observable } from 'rxjs';

import { PortCommandExecutionStatus } from './i-motors-feature';

export type ColorDescriptor = {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
};

export interface IRgbLightFeature {
  /**
   * Sets the color of the LED on the specified port
   * @param portId
   * @param color - the color to set, as an object with red, green and blue properties, each in the range 0-255
   * @param modeId - optional, defaults to WELL_KNOWN_PORT_MODE_IDS.rgbLightRgbColor
   */
  setRgbColor(portId: number, color: ColorDescriptor, modeId?: number): Observable<PortCommandExecutionStatus>;
}
