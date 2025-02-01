const SamlStrategy = require('passport-saml').Strategy;

module.exports = function (passport, config) {

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(new SamlStrategy(
    config.passport.saml,
    function (profile, done) {
      return done(null,
        {
          samlResponse: profile.getSamlResponseXml(),
          mail: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          firstName: profile ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
          lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']
        });
    })
  );

};
