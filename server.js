const app = require('./app');
const sequelize = require('./config/connection');

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is up and running!');
    });
  })
  .catch((error) => {
    console.error('Unable to connect to database!', error);
  });