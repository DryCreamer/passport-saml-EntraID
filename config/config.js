module.exports = {
  development: {
    app: {
      name: 'Passport SAML strategy example',
      port: process.env.PORT || 3000
    },
    passport: {
      strategy: 'saml',
      saml: {
        path: process.env.SAML_PATH || '/login/callback',
        entryPoint: process.env.SAML_ENTRY_POINT || 'https://login.microsoftonline.com/tenant-id/saml2', //get this from your Entra ID
        issuer: 'client-id', //this will be the client ID for Azure Entra ID Enterprise Application
        cert: process.env.SAML_CERT || 'fake-cert' //this comes from the Enterprise Application, all one line inside '', no spaces
      }
    }
  }
};
