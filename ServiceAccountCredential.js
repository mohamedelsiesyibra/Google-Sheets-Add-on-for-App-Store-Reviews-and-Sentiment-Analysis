// Function to set the properties
function setServiceAccountCreds() {

    // Replace this with your service account credentials
    var SERVICE_ACCOUNT_CREDS_PROPS = {
      type: "service_account",
      project_id: "string for the project id",
      private_key_id: "string for the private key id",
      private_key: "-----BEGIN PRIVATE KEY-----the private key-----END PRIVATE KEY-----\n",
      client_email: "serviceaccount@projectid.iam.gserviceaccount.com",
      client_id: "the client id",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "url"
    };
    
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperties(SERVICE_ACCOUNT_CREDS_PROPS);
  }