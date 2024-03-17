type Props = {
	className?: string;
};

const artSquares = [
	{
		color: 'black',
		size: 'h-8 w-8', // Size of the square
	},
	{
		color: 'yellow',
		size: 'h-4 w-4', // Smaller square
	},
	{
		color: 'black',
		size: 'h-12 w-12', // Larger square
	},
];

export default function Footer() {
	return (
		<footer className="bg-white mt-auto border-black border-t">
			<div className="w-full flex justify-center items-center" style={{ height: '150px' }}>
				<svg width="355" height="50" xmlns="http://www.w3.org/2000/svg">
					{/* Background */}
					<rect width="100%" height="100%" fill="white" />
					{/* Pixel Art for "LONDON" */}
					{/* L */}
					<rect x="0" y="0" width="10" height="50" fill="black" />
					<rect x="10" y="40" width="40" height="10" fill="black" />
					{/* O */}
					<rect x="60" y="0" width="10" height="50" fill="black" />
					<rect x="70" y="0" width="30" height="10" fill="black" />
					<rect x="70" y="40" width="30" height="10" fill="black" />
					<rect x="100" y="0" width="10" height="50" fill="black" />
					<rect x="70" y="10" width="30" height="30" fill="yellow" /> {/* Inner part of O */}
					{/* N */}
					<rect x="120" y="0" width="10" height="50" fill="black" />
					<rect x="130" y="10" width="10" height="10" fill="black" />
					<rect x="140" y="20" width="10" height="10" fill="black" />
					<rect x="150" y="30" width="10" height="10" fill="black" />
					<rect x="160" y="0" width="10" height="50" fill="black" />
					{/* D */}
					<rect x="180" y="0" width="10" height="50" fill="black" />
					<rect x="190" y="0" width="30" height="10" fill="black" />
					<rect x="190" y="40" width="30" height="10" fill="black" />
					<rect x="220" y="10" width="10" height="30" fill="black" />
					{/* X */}
					<rect x="240" y="0" width="10" height="10" fill="black" />
					<rect x="260" y="20" width="10" height="10" fill="black" />
					<rect x="250" y="10" width="30" height="30" fill="black" />
					<rect x="280" y="0" width="10" height="10" fill="black" />
					<rect x="240" y="40" width="10" height="10" fill="black" />
					<rect x="280" y="40" width="10" height="10" fill="black" />
					{/* N */}
					<rect x="300" y="0" width="10" height="50" fill="black" />
					<rect x="310" y="10" width="10" height="10" fill="black" />
					<rect x="320" y="20" width="10" height="10" fill="black" />
					<rect x="330" y="30" width="10" height="10" fill="black" />
					<rect x="340" y="0" width="10" height="50" fill="black" />
				</svg>
			</div>
		</footer>
	);
}
