// https://umijs.org/config/
import os from 'os';
import define from './env.config';
// import theme from './theme.config';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      targets: {
        ie: 11,
      },
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
      },
      ...(!process.env.TEST && os.platform() === 'darwin'
        ? {
          dll: {
            include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
            exclude: ['@babel/runtime'],
          },
          hardSource: true,
        }
        : {}),
    },
  ],
];

// judge add ga
if (process.env.APP_TYPE === 'site') {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

const proxy = {
  '/oauth': {
    // changeOrigin: true,
    target: 'http://112.74.177.132:8002/oauth',
    pathRewrite: { '^/oauth': '' },
  },
  '/api': {
    // changeOrigin: true,
    target: 'http://112.74.177.132:8002/api/',
    pathRewrite: { '^/api': '' },
  },
}

export default {
  // add for transfer to umi
  plugins,
  targets: { ie: 11 },
  define: {
    AUTH_NAME: "pro",
    OA_CLIENT_ID: "2",
    TOKEN_PREFIX: "OA_",
    APP_TYPE: process.env.APP_TYPE || '',
    OA_PATH: "http://112.74.177.132:8002",
    // OA_CRM_UPLOAD: "http://112.74.177.132:8003/admin/",
    OA_CLIENT_SECRET: "Z77PmFkOD9SMAIbVDZcKRxOD6f0YA0ck54amYEr1",
    ...define,
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...theme,
    'primary-color': defaultSettings.primaryColor,
  },
  externals: {
    '@antv/data-set': 'DataSet',
  },
  proxy,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = antdProPath
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },

  chainWebpack: webpackPlugin,
};