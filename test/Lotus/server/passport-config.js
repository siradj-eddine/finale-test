


// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcrypt');

// function initialize(passport, getUserByEmail, getUserById) {
//   passport.use(new LocalStrategy({ usernameField: 'email' },
//     async (email, password, done) => {
//       try {
//         const user = await getUserByEmail(email);
//         if (!user) return done(null, false, { message: 'No user with this email' });
//         if (await bcrypt.compare(password, user.password)) {
//           return done(null, user);
//         } else {
//           return done(null, false, { message: 'Password incorrect' });
//         }
//       } catch (err) {
//         return done(err);
//       }
//     }
//   ));

//   passport.serializeUser((user, done) => done(null, user.id));
//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await getUserById(id);
//       done(null, user);
//     } catch (err) {
//       done(err);
//     }
//   });
// }

// module.exports = initialize;

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const initializePassport = (
  passport, 
  getUserByEmail, // ← Injected from server.js
  getUserById      // ← Injected from server.js
) => {
  // Strategy configuration
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) return done(null, false, { message: 'No user with this email' });
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialization
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Deserialization
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

module.exports = initializePassport;
