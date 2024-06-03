//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(
			{
			      pages: 'build',
			      assets: 'build',
			      fallback: null,
     			 }						
		),
		paths: {
		      base: '/enjoyTest',
   		}		
	}
};

export default config;
