// loaded third
require('./main.js');

if (module.hot) {
  module.hot.accept('./main.js', function() {
    console.log('Changes to main.js');
  });
}