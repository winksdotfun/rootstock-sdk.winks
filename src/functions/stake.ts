import { ethers, Signer, TransactionRequest, TransactionReceipt, JsonRpcSigner } from "ethers";

export interface StakeOptions {
  valueWei?: string;
  valueEth?: string;
  useOriginalNonce?: boolean;
  dryRun?: boolean;
}

export interface StakeTransactionParams {
  txHash: string;
  signer: Signer;
  rpcUrl?: string;
  options?: StakeOptions;
}

export interface StakeTransactionResult {
  hash?: string;
  receipt?: TransactionReceipt | null;
  status: "success" | "failed" | "dry-run";
  broadcasted: boolean;
  signed?: string;
  request?: TransactionRequest;
}

/**
 * Execute a staking transaction using a connected wallet
 * @param {StakeTransactionParams} params
 * @returns {Promise<StakeTransactionResult>} Transaction result with hash and receipt
 */
export async function stakeTransaction({
  txHash,
  signer,
  rpcUrl = "https://rpc.mainnet.rootstock.io/n1BRY7Z5rx5VTs6xNnKdmu8x0SYSE7-M",
  options = {},
}: StakeTransactionParams): Promise<StakeTransactionResult> {
  const {
    valueWei,
    valueEth,
    useOriginalNonce = false,
    dryRun = false,
  } = options;

  // Create a provider for reading the original transaction
  const readProvider = new ethers.JsonRpcProvider(rpcUrl);

  console.log("Fetching transaction:", txHash);
  const tx = await readProvider.getTransaction(txHash);
  
  if (!tx) {
    throw new Error("Transaction not found. Check transaction hash and RPC URL.");
  }

  if (!tx.to) {
    throw new Error("Contract creation transactions are not supported (tx.to is empty).");
  }

  // Get the connected wallet address
  const walletAddress = await signer.getAddress();
  const txFrom = (tx.from ?? "").toLowerCase();
  const walletAddr = walletAddress.toLowerCase();

  if (txFrom && walletAddr !== txFrom) {
    console.warn(
      "⚠️  Warning: Original sender differs from your wallet.\n" +
      `  Original sender: ${tx.from}\n` +
      `  Your wallet: ${walletAddress}\n` +
      "The contract may behave differently with a different msg.sender."
    );
  }

  // Determine nonce
  let nonce: number;
  if (useOriginalNonce) {
    nonce = tx.nonce;
  } else {
    nonce = await signer.getNonce("pending");
  }

  // Build the transaction request
  const request: TransactionRequest = {
    to: tx.to,
    value: tx.value ?? 0n,
    data: tx.data ?? "0x",
    gasLimit: tx.gasLimit,
    nonce,
  };

  // Get network info from the signer's provider if available
  if (signer.provider) {
    const network = await signer.provider.getNetwork();
    request.chainId = network.chainId;
  }

  // Handle value overrides
  if (valueWei && valueEth) {
    console.warn("Both valueWei and valueEth provided; using valueWei.");
  }
  if (valueWei) {
    request.value = BigInt(valueWei);
  } else if (valueEth) {
    request.value = ethers.parseEther(valueEth);
  }

  // Preserve the fee model from the original transaction
  if (tx.gasPrice != null) {
    // Legacy transaction
    request.gasPrice = tx.gasPrice;
  } else if (tx.maxFeePerGas != null && tx.maxPriorityFeePerGas != null) {
    // EIP-1559 transaction
    request.type = 2;
    request.maxFeePerGas = tx.maxFeePerGas;
    request.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
  } else {
    throw new Error("Could not determine fee fields from the original transaction.");
  }

  console.log("Executing staking transaction with:", {
    from: walletAddress,
    to: request.to,
    valueWei: request.value?.toString(),
    nonce: request.nonce,
    gasLimit: request.gasLimit?.toString(),
    ...(request.gasPrice && { gasPriceWei: request.gasPrice.toString() }),
    ...(request.maxFeePerGas && {
      maxFeePerGasWei: request.maxFeePerGas.toString(),
      maxPriorityFeePerGasWei: request.maxPriorityFeePerGas.toString(),
    }),
  });

  if (dryRun) {
    const signed = await signer.signTransaction(request);
    console.log("Dry run complete. Signed transaction:");
    return {
      signed,
      request,
      status: "dry-run",
      broadcasted: false,
    };
  }

  console.log("Sending transaction...");
  const sentTx = await signer.sendTransaction(request);
  console.log("Transaction submitted:", sentTx.hash);

  console.log("Waiting for confirmation...");
  const receipt = await sentTx.wait();
  
  return {
    hash: sentTx.hash,
    receipt: receipt ?? null,
    status: receipt?.status === 1 ? "success" : "failed",
    broadcasted: true,
  };
}

/**
 * Helper to get signer from browser wallet (MetaMask, etc.)
 * @returns {Promise<JsonRpcSigner>}
 */
export async function getWalletSigner(): Promise<JsonRpcSigner> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No Ethereum wallet detected. Please install MetaMask or similar.");
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  
  // Request account access
  await provider.send("eth_requestAccounts", []);
  
  return provider.getSigner();
}
