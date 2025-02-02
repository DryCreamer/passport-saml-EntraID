# passport-saml-EntraID
## Here's my crushingly autisitc video instructions
https://www.youtube.com/watch?v=oPn96JiPu_8

I don't really know how github works to make a fork, but this started as Gerard Braad's passport-saml-example listed on passport's documentation

https://github.com/gbraad/passport-saml-example/

A lot of information was also dug up from the ADFS example deep inside the passport-saml repo
Also from passport's official documentation: https://www.passportjs.org/packages/passport-saml/

I just want to give credit due that I didn't create this, I only modifed it to:
1. Work with HTTPS
2. Work with Entra ID
3. View the SAML Claims from Entra ID
4. View the entire SamlReponse
5. Maybe have some better steps to setup right out of the box

# Pre-requisites: 
Install NodeJS and NPM, if you haven't already, duh

You'll need a SSL cert with as a .pem cert and its private key file 
	or a .pfx with private key and its password

You'll need an Enterprise Application inside of an Entra ID Azure Tenant - with the SSO setup, to get the cert

Identifier (Entity ID)
https://yourhostname:3000/login
Reply URL (Assertion Consumer Service URL)
https://yourhostname:3000/login/callback

the login/callback is kinda hard coded into the passport-saml js and files - its referenced for where to return the SAMLReponse POST

# Install and Getting Started:
Copy the passport-saml-example to where ever you can launch it

in that location:
put the .pfx or .pem cert files in that folder, same folder as app.js

create /public/bower_compoenents

Install the following modules for node:
example: npm install bootstrap

this will put those modules in folder a called node_modules

1. bootstrap, copy to /public/bower_compoenents - the steps didn't really call this out but you need it to avoid site errors
2. jquery, copy to /public/bower_compoenents - I'm sure the fancy YAML files would install and move jquery and bootstrap
3. express
4. express-session
5. https - this is added by me from the example for https - because http is effectively worthless in 2025
6. fs - this is added by me from the example to read the file system for the https cert
7. bower
8. path
9. passport
10. passport-saml
11. morgan
12. cookie-parser
13. body-parser
14. errorhander

Open app.js and update the cert information at the 'const server = https.createServer' line

To run, cert called in config.js must not be empty
in config\config.js, change null to 'fake-cert'
	we will change this later when we have an IDP

go to cmd, change dir to the passport-saml-example:

run node app.js
The server should start and listen on the port listed in config.js
and should resolve to https://hostname:port

In my youtube video its https://localhost:3000 - since that's what my cert has a name for

Use ctrl+c to stop the server

# Editing the Cofiguration and Claims

Under /config, edit the config.js file to have the client id, tenant saml2 link, and the cert from the Enterprise Application
	the cert needs to be all one line, inside the ''
	you can change the port in te config.fs file, like if it needs to be 443 or whatever

Edit the config/passport.js
	creates the 'user' that's refenced in the web pages
	the 'profile' object options are where the objects from the samlReponse land
	
	The passport-saml-example uses 
	    id: profile.uid,
          email: profile.email,
          displayName: profile.cn,
          firstName: profile.givenName,
          lastName: profile.sn

	which is like LDAP

Let's change those to use SAML Claims:

          samlResponse: profile.getSamlResponseXml(),
          mail: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          firstName: profile ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
          lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']

We changed id to samlResponse, email to mail, upn, firstName, lastName, etc

The passport documentation says to use getSamlResponseXml() to see the whole SAMLResponse, which is a function inside of the passport-saml module, deep in saml.js

so to call it:

Inside that profile object, add a property: samlResponse: profile.getSamlResponseXml()
In my example, I just replaced id: profile.uid

You can put any of the claims to pass back from your Entra ID Enterprise Application in here

We will need to remember the names of these to put into the actual 'Profile' and "Home' pages

# Edting the .JADE Webpages

To display what we've pulled from SAMLResponse and put into the 'profile' object
	We are gonna make jaces to:
 	home.jade
  	profile.jade
   
Open up app/view/home.jade
You see the line: h1 Hello, #{user.firstName}

This is calling the 'user' object from passport.js and the firstName property.
If we changed it to user.mail, for example, it would display the emailladdress that we put in: 
      mail: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],

Open up app/view/profile.jade

You see: 	dl
		dt Display name
		dd #{user.displayName}
		dt Email
		dd #{user.email}

The variables are the same, again as what we specified on the profile object in passport.js

so, since we changed 'email' to mail, we need to update dd #{user.email} to dd #{user.mail}

#{user.displayName} isn't doing anything since there is no displayName in the profile object inside passport.js
we can change it to #{user.upn} to pass that information from the upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']

Let's add a line to it:
		dt SAML Response XML
		dd #{user.samlResponse}

            This will pop in the entire SAMLReponse XML passed back from Entra ID:

Now, it should look like this:

	dl
		dt Display name
		dd #{user.upn}
		dt Email Address
		dd #{user.mail}
		dt SAML Response XML
		dd #{user.samlResponse}

Once everything is saved, go to console:

node app.js

The server should be started and listing on the port specified in config.js

Open a browser:

https://hostname:port

Click Login

It should redirect to Azure, and once you auth, you should land on the profile page, and see the first name in the Entra ID account.

If you click Profile, you should see the UPN, email, and the entire XML SAMLResponse back from Entra ID
