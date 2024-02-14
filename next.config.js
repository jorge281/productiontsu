/** @type {import('next').NextConfig} */
const nextConfig = {
	//output: 'export'
	env: {
		ENDPOINT_API: 'http://5.161.211.8:88'
	},
	images: {
	    remotePatterns: [
	      {
	        protocol: 'http',
	        hostname: 'localhost',
	        port: '3005',
	      },
	    ],
	}
}

module.exports = nextConfig
