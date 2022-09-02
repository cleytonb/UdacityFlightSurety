const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path");

module.exports = {
  entry: {
    bundle: ["./src/dapp/app.js"]
  },
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json'))
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
  output: {
    path: __dirname + "/public",
    filename: "[name].js",
    chunkFilename: "[name].[id].js"
  },
  module: {
    rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: true
						},
						emitCss: false,
						hotReload: true
					}
				}
			},
      {
        test: /\.css$/,
        use: [ MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
    ]
  },
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],
  devServer: {
    port: 8000,
    hot: true
    // static: {
    //   directory: path.join(__dirname, "dapp")
    // },
    // devMiddleware: {
    //   stats: "minimal"
    // }
  }
};
