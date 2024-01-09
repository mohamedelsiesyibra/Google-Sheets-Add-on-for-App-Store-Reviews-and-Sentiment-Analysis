// Function to analyze sentiment of a given text
function analyzeSentiment(text) {
  var serviceAccountKey = getYourServiceAccountKey(); // Retrieve your service account key
  var url = "https://language.googleapis.com/v2/documents:analyzeSentiment";
  var payload = {
    document: {
      type: "PLAIN_TEXT",
      content: text
    },
    encodingType: "UTF8"
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: 'Bearer ' + getOAuthToken(serviceAccountKey)
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());
  Logger.log(result);
  
  if (response.getResponseCode() == 200) {
    return {
      score: result.documentSentiment.score,
      language: result.languageCode
    };
  } else {
    Logger.log('Error: ' + result.message);
    return null;
  }
}

// Function to retrieve OAuth2 token
function getOAuthToken(serviceAccountKey) {
  var jwtClaimSet = {
    "iss": serviceAccountKey.client_email,
    "scope": "https://www.googleapis.com/auth/cloud-language",
    "aud": "https://oauth2.googleapis.com/token",
    "exp": Math.floor(Date.now() / 1000) + 3600,
    "iat": Math.floor(Date.now() / 1000)
  };

  var jwtHeader = {
    "alg": "RS256",
    "typ": "JWT"
  };

  var signatureInput = Utilities.base64EncodeWebSafe(JSON.stringify(jwtHeader)) + '.' + Utilities.base64EncodeWebSafe(JSON.stringify(jwtClaimSet));
  var signature = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  var jwt = signatureInput + '.' + Utilities.base64EncodeWebSafe(signature);

  var tokenResponse = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    payload: {
      "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "assertion": jwt
    },
    muteHttpExceptions: true
  });

  var accessToken = JSON.parse(tokenResponse.getContentText()).access_token;
  return accessToken;
}

// Function to get the service account key
function getYourServiceAccountKey() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var clientEmail = scriptProperties.getProperty('client_email');
  var privateKey = scriptProperties.getProperty('private_key');

  // Check if the client_email and private_key exist in Script Properties
  if (!clientEmail || !privateKey) {
    // If not found, set the service account credentials
    setServiceAccountCreds();
    // Retrieve them again after setting
    clientEmail = scriptProperties.getProperty('client_email');
    privateKey = scriptProperties.getProperty('private_key');
  }

  return {
    client_email: clientEmail,
    private_key: privateKey
  };
}


function analyzeSentimentForSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  // Clear existing data in columns E & F
  sheet.getRange("E2:F" + lastRow).clear();

  // Set headers
  sheet.getRange("E1").setValue("Sentiment");
  sheet.getRange("F1").setValue("Language");

  var range = sheet.getRange("B2:B" + lastRow);
  var texts = range.getValues();

  texts.forEach(function(row, index) {
    var cellValue = row[0].toString().trim();
    if (cellValue !== "") {
      var sentimentData = analyzeSentiment(cellValue);
      if (sentimentData) {

        // Set sentiment value and background color
        var sentimentCell = sheet.getRange(index + 2, 5);
        var languageCell = sheet.getRange(index + 2, 6);
        var sentimentScore = sentimentData.score;
        var detectedLanguage = sentimentData.language;
        var sentimentText = "";
        var backgroundColor = "#ffffff"; // Default white

        if (sentimentScore > 0) {
          sentimentText = "Positive";
          backgroundColor = "#00ff00"; // Green
        } else if (sentimentScore < 0) {
          sentimentText = "Negative";
          backgroundColor = "#ea9999"; // Red
        }

        sentimentCell.setValue(sentimentText);
        sentimentCell.setBackground(backgroundColor);
        languageCell.setValue(detectedLanguage);
      }
    }
  });
}


