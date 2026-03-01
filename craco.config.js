const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Overwrite CRA default entry point from index.js to index.tsx
            if (Array.isArray(webpackConfig.entry)) {
                webpackConfig.entry = webpackConfig.entry.map((path) =>
                    path.endsWith("index.js") ? path.replace("index.js", "index.tsx") : path
                );
            } else if (typeof webpackConfig.entry === 'string') {
                webpackConfig.entry = webpackConfig.entry.replace("index.js", "index.tsx");
            }
            return webpackConfig;
        },
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
};
