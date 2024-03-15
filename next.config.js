/** @type {import('next').NextConfig} */
const nextConfig = {
	//output: 'export'
	env: {
		ENDPOINT_API: 'https://4c5d-186-86-52-160.ngrok-free.app'
	},
	images: {
	    domains: ['4c5d-186-86-52-160.ngrok-free.app','pps.whatsapp.net'],
	}
}

module.exports = nextConfig
