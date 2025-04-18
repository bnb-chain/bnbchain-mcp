import { z } from "zod";

export const networkSchema = z.string()
  .describe("Network name (e.g. 'bsc', 'opbnb', 'ethereum', 'base', etc.) or chain ID. Supports others main popular networks. Defaults to BSC mainnet.")
  .optional(); 