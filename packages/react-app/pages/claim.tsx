import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/useWeb3';
import { getLinkDetails } from '@squirrel-labs/peanut-sdk';

const ClaimPage = () => {
	const { address, getUserAddress, getCUSDBalance, isLoading, claimPayLink } = useWeb3();
	const [claimed, setClaimed] = useState(false);
	const [claiming, setClaiming] = useState(false);
	const [cUSDBalance, setCUSDBalance] = useState<string>('0');
	const [payLink, setPayLink] = useState<string | undefined>(undefined);
	const [payLinkDetails, setPayLinkDetails] = useState<any | undefined>(undefined);

	useEffect(() => {
		const fetchData = async () => {
			await getUserAddress();
			const balance = await getCUSDBalance();
			setCUSDBalance(balance);

			// set the pay link to current full url including #
			const currentPayLink = window.location.href;
			setPayLink(currentPayLink);
			const linkDetails = await getLinkDetails({ link: currentPayLink });
			setPayLinkDetails(linkDetails);
			console.log('linkDetails', linkDetails);
		};
		fetchData();
	}, []);

	const handleClaim = async () => {
		setClaiming(true);
		try {
			await claimPayLink(payLink as string);
			setClaimed(true);
			// Update cUSD balance after claiming
			getCUSDBalance().then(setCUSDBalance);
		} catch (error) {
			console.error('Claiming failed:', error);
		} finally {
			setClaiming(false);
		}
	};

	if (!address) {
		return (
			<div className="p-6 flex flex-col items-center justify-center min-h-screen bg-white text-black">
				<h1 className="text-2xl font-bold">Please install Minipay to claim your money</h1>
				<a
					href="https://play.google.com/store/apps/details?id=com.opera.mini.native.beta&hl=en&gl=US"
					className="mt-4 py-2 px-4 bg-yellow-500 text-black font-bold rounded"
					target="_blank"
					rel="noopener noreferrer"
				>
					Install Minipay
				</a>
			</div>
		);
	}

	return (
		<div className="p-6 flex flex-col items-center justify-center my-auto bg-white text-black">
			{payLinkDetails && payLinkDetails.claimed && (
				<h1 className="text-2xl font-bold">You have already claimed this paylink</h1>
			)}
			{payLinkDetails && !payLinkDetails.claimed && (
				<>
					<h2 className="text-9xl font-bold my-4">{payLinkDetails.tokenAmount}</h2>
					<p className="text-2xl my-4">
						{'$'}
						{payLinkDetails.tokenSymbol}
					</p>
				</>
			)}
			<p className="text-lg my-4">Your cUSD Balance: {cUSDBalance}</p>
			{payLinkDetails && !payLinkDetails.claimed && (
				<>
					{!claimed ? (
						<>
							<div className="mt-6">
								<button
									onClick={handleClaim}
									className="bg-yellow-400 text-black font-bold py-4 px-4"
									disabled={claiming}
								>
									{claiming ? 'Claiming...' : 'Claim PayLink'}
								</button>
							</div>
						</>
					) : (
						<p className="text-lg my-4 font-bold">Success! You've claimed your paylink.</p>
					)}
				</>
			)}
		</div>
	);
};

export default ClaimPage;
