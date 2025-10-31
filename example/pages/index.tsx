import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Winks Example App</title>
        <meta name="description" content="A NextJS app demonstrating Winks meta tag management" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            🚀 Winks Example
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            This page demonstrates how Winks automatically populates meta tags for SEO and social media sharing, plus advanced wallet integration and token transfer functions for Rootstock.
          </p>

          {/* Navigation */}
          <div className="mb-12">
            <Link 
              href="/simple-tokens" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              💰 Simple Token Functions
            </Link>
            <Link 
              href="/wallet-integration" 
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              🔗 Wallet Integration Demo
            </Link>
            <a 
              href="https://github.com/winksdotfun/winksdotfun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📚 View Documentation
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              How it works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-4">1. Wrap your app</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { Winks } from 'rootstockwinks';

export default function App({ Component, pageProps }) {
  return (
    <Winks apikey="your-api-key">
      <Component {...pageProps} />
    </Winks>
  );
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4">2. Set metadata</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`curl -X POST http://localhost:3001/api/meta/YOUR_API_KEY \\
  -H "Content-Type: application/json" \\
  -d '{
    "metadata": {
      "title": "My Website",
      "description": "Welcome to my website"
    }
  }'`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">
              ✨ Meta tags are automatically populated!
            </h3>
            <p className="text-blue-700">
              Check the page source or use browser dev tools to see the meta tags that Winks has added.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p>Built with ❤️ using Winks</p>
      </footer>
    </div>
  );
} 