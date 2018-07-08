## Forbidden Imports Plugin

Detect dependencies that are declared as forbidden.

Useful when working with teams and you want to restrict or deprecate dependencies.

### Webpack Versions

Supports webpack `4.0.1` and greater as a peer dependency. 

### Basic Usage

```js
// webpack.config.js
const ForbiddenImportsPlugin = require('forbidden-imports-plugin')

module.exports = {
  entry: "./src/index",
  plugins: [
        new ForbiddenImportsPlugin([{
            // Regexp to check the file that contains the import statement
            issuer: /a.js/,

            // Regexp to check the target file, the one that is going to be imported
            target: /b.js/,

            // Emiting level can be 'error' or 'warning'
            // Errors will make the build fail
            level: 'warning'
        },{
            issuer: /b.js/,
            target: /a.js/,
        }])
    ]
}
```
