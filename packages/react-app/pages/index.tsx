import PrimaryButton from '@/components/Button';
import { useWeb3 } from '@/contexts/useWeb3';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'qrcode.react'; // Import QRCode component correctly
export default function Home() {
	const {
		address,
		payLink,
		getUserAddress,
		createPayLink,
		getCUSDBalance,
		isLoading, // Destructure isLoading
	} = useWeb3();
	const [tx, setTx] = useState<any>(undefined);
	const [cUSDBalance, setCUSDBalance] = useState<string>('0');
	const { register, handleSubmit, watch, setValue } = useForm();
	const payLinkAmount = watch('payLinkAmount');

	useEffect(() => {
		getUserAddress().then(() => {
			getCUSDBalance().then(setCUSDBalance);
		});
	}, [address, getUserAddress, getCUSDBalance]);

	const onSubmit = useCallback(
		async (data: any) => {
			const { payLinkAmount } = data;
			if (payLinkAmount) {
				await createPayLink(payLinkAmount);
			}
		},
		[createPayLink]
	);

	const copyToClipboard = (link: string) => {
		navigator.clipboard.writeText(link).then(() => {
			// Optionally, you can display a message confirming the link was copied.
		});
	};

	return (
		<div
			className="flex flex-col justify-center items-center p-6"
			style={{ backgroundColor: 'white', color: 'black' }}
		>
			{!address && (
				<>
					<div className="text-2xl font-bold">Please install MiniPay and connect.</div>
					<a
						href="https://play.google.com/store/apps/details?id=com.opera.mini.native.beta&hl=en&gl=US"
						className="mt-4 py-2 px-4 bg-yellow-500 text-black font-bold rounded text-md"
						target="_blank"
						rel="noopener noreferrer"
					>
						Install Minipay
					</a>
				</>
			)}
			{address && (
				<>
					<div className="text-2xl font-bold">Create a payment link!</div>

					<div className="text-center my-6">
						Your cUSD balance: <span className="font-bold text-lg">${cUSDBalance}</span>
					</div>
					{tx && <p className="font-bold my-6 text-lg">Tx Completed: {tx.hash}</p>}
					{!payLink && (
						<form onSubmit={handleSubmit(onSubmit)} className="w-full">
							<div className="my-6">
								<label htmlFor="payLinkAmount" className="block text-xl font-bold">
									Amount for PayLink
								</label>
								<input
									type="text"
									id="payLinkAmount"
									{...register('payLinkAmount', { required: true })}
									className="mt-2 p-3 w-full text-xl border-2 border-black"
									placeholder="Enter amount"
									style={{ backgroundColor: 'white', color: 'black' }}
								/>
							</div>
							<button type="submit" className="w-full py-3 text-xl font-bold text-white bg-black">
								{isLoading ? 'Creating...' : 'Create PayLink'}
							</button>
						</form>
					)}
					{isLoading && (
						<div className="mt-6 flex flex-col items-center">
							<div className="brutalist-spinner"></div>
						</div>
					)}
					{payLink && (
						<div className="mt-6 flex flex-col items-center">
							<div className="text-xl font-bold">Your payLink:</div>
							<input
								type="text"
								value={payLink}
								readOnly
								className="p-3 border-2 border-black text-xl w-full"
								style={{ backgroundColor: 'white', color: 'black' }}
							/>
							<button
								onClick={() => copyToClipboard(payLink)}
								className="mt-3 py-3 px-5 bg-yellow-500 font-bold text-black text-lg w-full"
							>
								Copy
							</button>
							<div className="mt-4">
								<QRCode value={payLink} size={256} level={'H'} includeMargin={true} />
							</div>
							<a href={payLink} className="text-sm font-bold underline">
								direct
							</a>
						</div>
					)}
				</>
			)}
		</div>
	);
}
