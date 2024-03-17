import { useState } from 'react';
import StableTokenABI from './cusd-abi.json';
import MinipayNFTABI from './minipay-nft.json';
import { createPublicClient, createWalletClient, custom, getContract, http, parseEther, stringToHex } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { peanut } from '@squirrel-labs/peanut-sdk';

const publicClient = createPublicClient({
	chain: celoAlfajores,
	transport: http(),
});

const cUSDTokenAddress = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'; // Testnet
const MINIPAY_NFT_CONTRACT = '0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF'; // Testnet
const PEANUT_CONTRACT = '0x5c1b67ED2809e371aabbc58D934282E8Aa7E3fd4'; // Testnet
const API_KEY = 'WmF4CRls5tMq7BtvTKMu2u5loqtcgUDp';

export const useWeb3 = () => {
	const [address, setAddress] = useState<string | null>(null);

	const getUserAddress = async () => {
		if (typeof window !== 'undefined' && window.ethereum) {
			let walletClient = createWalletClient({
				transport: custom(window.ethereum),
				chain: celoAlfajores,
			});

			let [address] = await walletClient.getAddresses();
			setAddress(address);
			return address; // Return the address
		}
		return null; // Return null if the condition is not met
	};

	const sendCUSD = async (to: string, amount: string) => {
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: celoAlfajores,
		});

		let [address] = await walletClient.getAddresses();

		const amountInWei = parseEther(amount);

		const tx = await walletClient.writeContract({
			address: cUSDTokenAddress,
			abi: StableTokenABI.abi,
			functionName: 'transfer',
			account: address,
			args: [to, amountInWei],
		});

		console.log(tx);

		let receipt = await publicClient.waitForTransactionReceipt({
			hash: tx,
		});

		console.log(receipt);

		return receipt;
	};

	// const createPayLink = async (amount: string) => {
	const createPayLink = async () => {
		const chainId = '44787'; // Celo Alfajores

		const linkDetails = {
			chainId: chainId,
			tokenAmount: 0.00001,
			tokenType: 1, // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
			tokenDecimals: 6,
			tokenAddress: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
		};
		const password = await peanut.getRandomString(16);

		const userAddress = await getUserAddress();
		if (!userAddress) {
			console.error('User address is not available. Make sure the user is connected.');
			return;
		}

		const preparedTransactions = await peanut.prepareDepositTxs({
			address: userAddress,
			linkDetails,
			passwords: [password],
		});

		const transactionHashes: string[] = [];
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: celoAlfajores,
		});

		for (const unsignedTx of preparedTransactions.unsignedTxs) {
			console.log('unsignedTx', unsignedTx);
			// from: undefined, to: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', data: '0x095ea7b30000000000000000000000005c1b67ed2809e371…000000000000000000000000000000000000000000000000a', value: null}

			// Prepare the transaction request
			console.log('prepareTransactionRequest');
			console.log('userAddress', userAddress);
			console.log('userAddress', walletClient);
			const request = await walletClient.prepareTransactionRequest({
				account: userAddress as `0x${string}`, // Type assertion here
				to: unsignedTx.to as `0x${string}`, // Type assertion here
				data: unsignedTx.data as `0x${string}`, // And here,
				gasPrice: BigInt('11000000000'),
			});
			console.log('request', request);

			// Sign the transaction
			console.log('signTransaction');
			const signature = await walletClient.signTransaction(request as any);

			// Send the signed transaction
			console.log('sendRawTransaction');
			const txHash = await walletClient.sendRawTransaction({ serializedTransaction: signature });
			console.log(txHash);

			// Optionally, wait for the transaction to be mined (not shown here)

			// Push the transaction hash to your array
			transactionHashes.push(txHash);

			// Console log the transaction hash
			console.log(txHash);
		}
	};

	const mintMinipayNFT = async () => {
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: celoAlfajores,
		});

		let [address] = await walletClient.getAddresses();

		const tx = await walletClient.writeContract({
			address: MINIPAY_NFT_CONTRACT,
			abi: MinipayNFTABI.abi,
			functionName: 'safeMint',
			account: address,
			args: [
				address,
				'https://cdn-production-opera-website.operacdn.com/staticfiles/assets/images/sections/2023/hero-top/products/minipay/minipay__desktop@2x.a17626ddb042.webp',
			],
		});

		const receipt = await publicClient.waitForTransactionReceipt({
			hash: tx,
		});

		return receipt;
	};

	const getNFTs = async () => {
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: celoAlfajores,
		});

		const minipayNFTContract = getContract({
			abi: MinipayNFTABI.abi,
			address: MINIPAY_NFT_CONTRACT,
			client: publicClient,
		});

		const [address] = await walletClient.getAddresses();
		const nfts: any = await minipayNFTContract.read.getNFTsByAddress([address]);

		let tokenURIs: string[] = [];

		for (let i = 0; i < nfts.length; i++) {
			const tokenURI: string = (await minipayNFTContract.read.tokenURI([nfts[i]])) as string;
			tokenURIs.push(tokenURI);
		}
		return tokenURIs;
	};

	const signTransaction = async () => {
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: celoAlfajores,
		});

		let [address] = await walletClient.getAddresses();

		const res = await walletClient.signMessage({
			account: address,
			message: stringToHex('Hello from Celo Composer MiniPay Template!'),
		});

		return res;
	};

	return {
		address,
		getUserAddress,
		sendCUSD,
		mintMinipayNFT,
		getNFTs,
		signTransaction,
		createPayLink,
	};
};
