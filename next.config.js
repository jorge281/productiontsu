/** @type {import('next').NextConfig} */
const nextConfig = {
	//output: 'export'
	env: {
		ENDPOINT_API: 'http://localhost',
		ENDPOINT_API2: 'http://localhost:2958',
		ENDPOINT_SOCKET: 'http://localhost',
		ENDPOINT_SOCKET2: 'http://localhost:2958',
		ENDPOINT_FRONT: 'http://localhost',
		ENDPOINT_IMG: 'http://localhost/static/',
		ENDPOINT_COMPROBANTES: 'http://localhost/static/comprobantes/',
		ASSETS_API2: 'http://localhost:2958/assets',
	},
	images: {
	    domains: ['192.168.1.23','pps.whatsapp.net','192.168.1.13:89','stale-buses-sort.loca.lt','www.crmtsu.com'],
	},
	reactStrictMode: true
}

module.exports = nextConfig
