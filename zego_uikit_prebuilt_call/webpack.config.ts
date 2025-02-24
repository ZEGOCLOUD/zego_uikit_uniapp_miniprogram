const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  devtool: false,
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue',
    },
  },
  resolve: {
    extensions: ['.vue', '.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          { loader: 'vue-loader' }, 
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } }, './custom-loader.js'],
        exclude: /node_modules/,
      },
      {
        test: /\.(jpg|png|gif|svg|jpeg)$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    // 复制和修改资源
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/components', // 源资源路径
          to: 'src/components', // 目标路径和文件名
          transform(content: any) {
            // 使用正则表达式替换资源中的路径
            let replacements: any = {
              "..\/..\/zego_uikit\/src": "../uikit",
              "..\/index": "@zegocloud/zego-uikit-prebuilt-call-mini-program",
            };
            // 创建一个正则表达式，使用全局搜索标志
            let pattern = new RegExp(Object.keys(replacements).join("|"), "gi");
            // 执行替换
            let contentString = content.toString();
            contentString = contentString.replace(pattern, function(match: any) {
              return replacements[match];
            });
            
            return Buffer.from(contentString);
          }
        },
        {
          from: 'src/pages', // 源资源路径
          to: 'src/pages', // 目标路径和文件名
          transform(content: any) {
            // 使用正则表达式替换资源中的路径
            let replacements: any = {
              "..\/..\/..\/zego_uikit\/src": "../../uikit",
              "..\/..\/index": "@zegocloud/zego-uikit-prebuilt-call-mini-program",
            };
            // 创建一个正则表达式，使用全局搜索标志
            let pattern = new RegExp(Object.keys(replacements).join("|"), "gi");
            // 执行替换
            let contentString = content.toString();
            contentString = contentString.replace(pattern, function(match: any) {
              return replacements[match];
            });
            
            return Buffer.from(contentString);
          }
        },
        {
          from: 'zego_uikit/src/components', // 源资源路径
          to: 'src/uikit/components', // 目标路径和文件名
          transform(content: any) {
            // 使用正则表达式替换资源中的路径
            let replacements: any = {
              "..\/..\/index": "@zegocloud/zego-uikit-prebuilt-call-mini-program",
            };
            // 创建一个正则表达式，使用全局搜索标志
            let pattern = new RegExp(Object.keys(replacements).join("|"), "gi");
            
            // 执行替换
            let contentString = content.toString();
            contentString = contentString.replace(pattern, function(match: any) {
              return replacements[match];
            });
            
            return Buffer.from(contentString);
          }
        },
        {
          from: 'zego_uikit/src/assets', // 源资源路径
          to: 'src/uikit/assets', // 目标路径和文件名
        },
        {
          from: 'public', // 源资源路径
          to: './', // 目标路径和文件名
        },
      ]
    }),
    new CleanWebpackPlugin({
      // 在删除前进行确认
      dry: false,
      // 启用 verbose 模式，打印删除的文件
      verbose: false,
      // 每次构建（包括监视模式）后删除与此模式匹配的文件。
      cleanAfterEveryBuildPatterns: ["zego_uikit/node_modules"]
    }),
  ],
};
