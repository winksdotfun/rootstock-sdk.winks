const FAUCET_API_URL =
  "https://seahorse-app-s5olo.ondigitalocean.app/api/faucet-rootstock";

export interface FaucetResult {
  txHash?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * Requests testnet RBTC from the Rootstock faucet for the given address.
 *
 * @param address - The Rootstock wallet address to fund.
 * @returns The faucet API response payload.
 * @throws {Error} If the request fails or the API returns an error.
 *
 * @example
 * ```ts
 * import { faucet } from 'rootstock-sdk.winks';
 *
 * const result = await faucet('0xYourAddressHere');
 * console.log(result.txHash);
 * ```
 */
export async function faucet(address: string): Promise<FaucetResult> {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    throw new Error("Faucet error: address must not be empty");
  }

  try {
    const res = await fetch(FAUCET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: trimmedAddress }),
    });

    const data: FaucetResult = await res.json();

    if (!res.ok) {
      throw new Error((data.error as string) || "Faucet request failed");
    }

    return data;
  } catch (err) {
    throw new Error(`Faucet error: ${(err as Error).message}`);
  }
}
