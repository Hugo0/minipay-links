import { useState } from 'react';
import StableTokenABI from './cusd-abi.json';
import MinipayNFTABI from './minipay-nft.json';
import { createPublicClient, createWalletClient, custom, getContract, http, parseEther, stringToHex } from 'viem';
import { celoAlfajores, celo } from 'viem/chains'; // Import celo
import { peanut } from '@squirrel-labs/peanut-sdk';

// Adjust the chain and token address based on the isTestnet flag
const isTestnet = false;
const chain = isTestnet ? celoAlfajores : celo;
const cUSDTokenAddress = isTestnet
	? '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
	: '0x765de816845861e75a25fca122bb6898b8b1282a';
const chainId = isTestnet ? '44787' : '42220';

const publicClient = createPublicClient({
	chain: chain,
	transport: http(),
});

export const useWeb3 = () => {
	const [address, setAddress] = useState<string | null>(null);
	const [payLink, setPayLink] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false); // Add this line

	const getUserAddress = async () => {
		if (typeof window !== 'undefined' && window.ethereum) {
			let walletClient = createWalletClient({
				transport: custom(window.ethereum),
				chain: chain,
			});

			let [address] = await walletClient.getAddresses();
			setAddress(address);
			return address; // Return the address
		}
		return null; // Return null if the condition is not met
	};

	const createPayLink = async (amount: string) => {
		setIsLoading(true); // Start loading
		try {
			const linkDetails = {
				chainId: chainId,
				tokenAmount: parseFloat(amount), // Use the amount parameter here
				tokenType: 1, // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
				tokenDecimals: 18,
				tokenAddress: cUSDTokenAddress,
			};
			console.log('linkDetails', linkDetails);
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
				chain: chain,
			});

			for (const unsignedTx of preparedTransactions.unsignedTxs) {
				console.log('unsignedTx', unsignedTx);

				const txHash = await walletClient.sendTransaction({
					account: userAddress as `0x${string}`,
					to: unsignedTx.to as `0x${string}`,
					data: unsignedTx.data as `0x${string}`,
				});

				transactionHashes.push(txHash);
				console.log(txHash);
			}

			const { links } = await peanut.getLinksFromTx({
				linkDetails,
				passwords: [password],
				txHash: transactionHashes[transactionHashes.length - 1],
			});
			console.log('links', links[0]);
			setPayLink(links[0]);
			return links[0];
		} catch (error) {
			console.error("Error creating paylink:", error);
		} finally {
			setIsLoading(false); // Stop loading regardless of outcome
		}
	};

	const getCUSDBalance = async () => {
		if (!address) return '0';
		let walletClient = createWalletClient({
			transport: custom(window.ethereum),
			chain: chain,
		});

		const cUSDContract = getContract({
			abi: StableTokenABI.abi,
			address: cUSDTokenAddress,
			client: publicClient,
		});

		const balance = (await cUSDContract.read.balanceOf([address])) as BigInt;
		let balanceStr = balance.toString();
		if (balanceStr.length > 18) {
			const wholePart = balanceStr.slice(0, balanceStr.length - 18);
			const decimalPart = balanceStr.slice(balanceStr.length - 18, balanceStr.length - 16);
			balanceStr = `${wholePart}.${decimalPart}`;
		} else {
			balanceStr = `0.${balanceStr.padStart(18, '0').slice(0, 2)}`;
		}
		return balanceStr;
	};

	return {
		address,
		payLink,
		isLoading,
		getUserAddress,
		createPayLink,
		getCUSDBalance,
	};
};
