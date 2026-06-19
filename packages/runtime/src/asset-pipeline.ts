export interface AssetProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateSprite(opts: { prompt: string; size: number; palette: string[] }): Promise<Buffer | null>;
}

export class NullAssetProvider implements AssetProvider {
  name = 'rect-colors';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateSprite(_opts: { prompt: string; size: number; palette: string[] }): Promise<Buffer | null> {
    return null;
  }
}
